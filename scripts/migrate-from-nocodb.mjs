/**
 * One-off migration: NocoDB `Website` base → the Sanity `production` dataset.
 *
 * Covers the four read-side tables the website renders:
 *   - OurStartups  (mf0gbvfzl1wkaha) → `startup`
 *   - Partner      (msnxq3vgfyxywcm) → `partner`
 *   - NetworkLogos (mh8taz9b8ne38yg) → `networkCompany`
 *   - LatestNews   (mq62bo82l5r8qo4) → `newsItem`
 *
 * The Waitlist table is deliberately NOT migrated: it holds 303 real email
 * addresses and the `production` dataset is world-readable without a token.
 * See `docs/nocodb-migration.md`.
 *
 * Idempotent: every document is matched on `legacyId` first, so a re-run
 * patches the existing document instead of creating a duplicate.
 *
 * Usage:
 *   SANITY_API_WRITE_TOKEN=... \
 *   NOCODB_API_TOKEN=... \
 *   node scripts/migrate-from-nocodb.mjs [--dry-run] [--only=startup,partner]
 */
import {createClient} from '@sanity/client'
import process from 'node:process'

const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'j77hk8qc'
const DATASET = process.env.SANITY_DATASET || 'production'
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://ndb.startmunich.de'

const TABLES = {
  startup: {id: 'mf0gbvfzl1wkaha', name: 'OurStartups'},
  partner: {id: 'msnxq3vgfyxywcm', name: 'Partner'},
  networkCompany: {id: 'mh8taz9b8ne38yg', name: 'NetworkLogos'},
  newsItem: {id: 'mq62bo82l5r8qo4', name: 'LatestNews'},
}

const dryRun = process.argv.includes('--dry-run')
const onlyArg = process.argv.find((a) => a.startsWith('--only='))
const only = onlyArg
  ? new Set(
      onlyArg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim()),
    )
  : null

const writeToken = process.env.SANITY_API_WRITE_TOKEN
const nocoToken = process.env.NOCODB_API_TOKEN

if (!writeToken && !dryRun) {
  console.error(
    'SANITY_API_WRITE_TOKEN is required (https://www.sanity.io/manage/personal-access-tokens)',
  )
  process.exit(1)
}
if (!nocoToken) {
  console.error('NOCODB_API_TOKEN is required')
  process.exit(1)
}

const sanity = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: writeToken,
  apiVersion: '2025-02-19',
  useCdn: false,
})

/** Fetch every row of a NocoDB table, paging at 1000. */
async function fetchTable(tableId) {
  const rows = []
  const limit = 1000
  let offset = 0
  for (;;) {
    const url = `${NOCODB_BASE_URL}/api/v2/tables/${tableId}/records?limit=${limit}&offset=${offset}`
    const res = await fetch(url, {headers: {'xc-token': nocoToken}})
    if (!res.ok) throw new Error(`NocoDB ${tableId}: ${res.status} ${res.statusText}`)
    const data = await res.json()
    const list = data.list || []
    rows.push(...list)
    if (list.length < limit) break
    offset += limit
  }
  return rows
}

/**
 * Download a NocoDB attachment and upload it to the Sanity asset pipeline.
 * Returns an image field value, or undefined when there is no attachment.
 *
 * Reuses an existing asset when the same NocoDB attachment id was already
 * imported, so re-running the migration does not re-upload ~230 files.
 */
const assetCache = new Map()

async function importImage(attachment, title) {
  if (!attachment || !Array.isArray(attachment) || !attachment[0]) return undefined
  const file = attachment[0]
  if (!file.path) return undefined

  if (assetCache.has(file.id)) return assetCache.get(file.id)
  if (file.id) {
    const [existing] = await sanity.fetch(
      `*[_type == "sanity.imageAsset" && metadata.nocoAttachmentId == $id][0]{_id}`,
      {id: file.id},
    )
    if (existing) {
      const ref = {_type: 'reference', _ref: existing._id}
      assetCache.set(file.id, ref)
      return ref
    }
  }

  const src = `${NOCODB_BASE_URL}/${file.path}`
  const res = await fetch(src)
  if (!res.ok) {
    console.warn(`    ! image fetch failed ${res.status} for ${src}`)
    return undefined
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await sanity.assets.upload('image', buffer, {
    filename: file.title || 'upload',
    // Recorded so a re-run reuses the asset instead of uploading it twice.
    source: {id: file.id, name: 'NocoDB', url: src},
  })
  await sanity.patch(asset._id).set({'metadata.nocoAttachmentId': file.id}).commit()
  const ref = {_type: 'reference', _ref: asset._id}
  assetCache.set(file.id, ref)
  return ref
}

/** NocoDB stores booleans as "yes"/"no" strings, 0/1 numbers or booleans. */
const isYes = (v) =>
  String(v ?? '')
    .trim()
    .toLowerCase() === 'yes'
const isTruthy = (v) => v === true || v === 1 || String(v).toLowerCase() === 'true'

const slugify = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

/** Ensure the generated slug is unique within the type, mirroring NocoDB's Id. */
async function uniqueSlug(type, base, legacyId) {
  const clean = slugify(base) || `item-${legacyId}`
  const clash = await sanity.fetch(
    `count(*[_type == $type && slug.current == $slug && legacyId != $legacyId])`,
    {type, slug: clean, legacyId: String(legacyId)},
  )
  if (!clash) return clean
  return `${clean}-${legacyId}`
}

async function upsert(type, legacyId, fields) {
  const [existing] = await sanity.fetch(`*[_type == $type && legacyId == $legacyId][0]{_id}`, {
    type,
    legacyId: String(legacyId),
  })
  if (existing) {
    await sanity
      .patch(existing._id)
      .set({...fields, legacyId: String(legacyId)})
      .commit()
    return {action: 'updated', id: existing._id}
  }
  const created = await sanity.create({_type: type, legacyId: String(legacyId), ...fields})
  return {action: 'created', id: created._id}
}

/* ---------------------------------------------------------------- startups */

async function migrateStartups() {
  const rows = await fetchTable(TABLES.startup.id)
  console.log(`\nstartup: ${rows.length} NocoDB rows`)
  const stats = {created: 0, updated: 0, skipped: 0}

  for (const [i, row] of rows.entries()) {
    const legacyId = row.Id ?? row.id
    if (legacyId === undefined || legacyId === null) {
      stats.skipped += 1
      continue
    }
    const name = row['Startup Name'] || 'Unnamed Startup'

    if (dryRun) {
      console.log(`  [dry] ${legacyId} ${name}`)
      continue
    }

    const logo = await importImage(row['Company Logo'], `${name} logo`)
    const founderImage = await importImage(
      row['Member Picture'],
      `${row['STARTMunich Member']} portrait`,
    )
    const memberName = row['STARTMunich Member']

    const categories = row['Chategory']
      ? String(row['Chategory'])
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : []

    const result = await upsert('startup', legacyId, {
      name,
      slug: {_type: 'slug', current: await uniqueSlug('startup', name, legacyId)},
      summary: row['Short Description'] || 'No description available',
      description:
        row['Description Long'] || row['Short Description'] || 'No description available',
      logo,
      // NocoDB stored bare domains ("traderepublic.com/de-de"); the schema
      // field is a url, so normalise to a full https:// URL.
      website: row['Company Website']
        ? /^https?:\/\//i.test(row['Company Website'])
          ? row['Company Website']
          : `https://${row['Company Website']}`
        : undefined,
      foundingYear: row['Founding Year'] || undefined,
      categories,
      isSpotlight: isYes(row['Featured Startup']),
      isYCombinatorAlumni: isYes(row['Y Combinator Alumni']),
      isMTZ: isYes(row.MTZ),
      isEWOR: isYes(row.EWOR),
      companyLinkedin: row['Company Linkedin'] || undefined,
      milestones: row['First milestones'] || undefined,
      supportingPrograms: row['Supporting Programs'] || undefined,
      founders: memberName
        ? [
            {
              _type: 'founder',
              _key: 'nocodb-member',
              name: memberName,
              role: row['Company Role'] || 'Founder',
              batch: (row['Member Batch'] || row.Batch || '').trim() || undefined,
              image: founderImage,
              linkedin: row['Member Linkedin'] || undefined,
            },
          ]
        : undefined,
    })

    stats[result.action === 'created' ? 'created' : 'updated'] += 1
    console.log(
      `  ${result.action} ${name} (${i + 1}/${rows.length})` + (logo ? '' : '  [no logo]'),
    )
  }
  console.log(`  -> ${JSON.stringify(stats)}`)
}

/* ---------------------------------------------------------------- partners */

async function migratePartners() {
  const rows = await fetchTable(TABLES.partner.id)
  console.log(`\npartner: ${rows.length} NocoDB rows`)
  const stats = {created: 0, updated: 0, hidden: 0}

  for (const [i, row] of rows.entries()) {
    const legacyId = row.Id
    if (legacyId === undefined || legacyId === null) continue
    const name = row.Name || 'Unnamed Partner'

    if (dryRun) {
      console.log(`  [dry] ${legacyId} ${name} show=${row.Show} featured=${row.Featured}`)
      continue
    }

    const logo = await importImage(row.Logo, `${name} logo`)
    const logoNoBackground = await importImage(row.LogoNoBackground, `${name} logo (transparent)`)

    const result = await upsert('partner', legacyId, {
      name,
      slug: {_type: 'slug', current: await uniqueSlug('partner', name, legacyId)},
      category: row.Categrory || 'Other',
      logo,
      logoNoBackground,
      isFeatured: isTruthy(row.Featured),
      isVisible: isTruthy(row.Show),
    })

    if (!isTruthy(row.Show)) stats.hidden += 1
    stats[result.action === 'created' ? 'created' : 'updated'] += 1
    console.log(`  ${result.action} ${name} (${i + 1}/${rows.length})`)
  }
  console.log(`  -> ${JSON.stringify(stats)} (${stats.hidden} hidden on the website)`)
}

/* ------------------------------------------------------- network companies */

async function migrateNetworkCompanies() {
  const rows = await fetchTable(TABLES.networkCompany.id)
  console.log(`\nnetworkCompany: ${rows.length} NocoDB rows`)
  const stats = {created: 0, updated: 0}

  for (const [i, row] of rows.entries()) {
    const legacyId = row.Id
    if (legacyId === undefined || legacyId === null) continue
    const name = row.Name || 'Company'

    if (dryRun) {
      console.log(`  [dry] ${legacyId} ${name}`)
      continue
    }

    const logo = await importImage(row.Logo, `${name} logo`)
    if (!logo) {
      console.warn(`  ! skipped ${name} - no logo, and the field is required`)
      continue
    }

    // NetworkLogos has no slug column and nothing routes by id, so key the
    // document on its unique name instead of minting a slug.
    const [existing] = await sanity.fetch(
      `*[_type == "networkCompany" && (legacyId == $legacyId || name == $name)][0]{_id}`,
      {legacyId: String(legacyId), name},
    )
    const fields = {
      name,
      type: row.Type || 'Other',
      logo,
      legacyId: String(legacyId),
    }
    if (existing) {
      await sanity.patch(existing._id).set(fields).commit()
      stats.updated += 1
      console.log(`  updated ${name} (${i + 1}/${rows.length})`)
    } else {
      await sanity.create({_type: 'networkCompany', ...fields})
      stats.created += 1
      console.log(`  created ${name} (${i + 1}/${rows.length})`)
    }
  }
  console.log(`  -> ${JSON.stringify(stats)}`)
}

/* -------------------------------------------------------------- news items */

async function migrateNewsItems() {
  const rows = await fetchTable(TABLES.newsItem.id)
  console.log(`\nnewsItem: ${rows.length} NocoDB rows`)
  const stats = {created: 0, updated: 0, skipped: 0}

  for (const [i, row] of rows.entries()) {
    const legacyId = row.Id ?? row.id
    if (legacyId === undefined || legacyId === null) {
      stats.skipped += 1
      continue
    }
    const title = row.Title || 'Untitled'

    if (dryRun) {
      console.log(`  [dry] ${legacyId} ${title}`)
      continue
    }

    const image = await importImage(row.Image, `${title} image`)
    if (!image) {
      console.warn(`  ! skipped ${title} - no image, and the field is required`)
      stats.skipped += 1
      continue
    }

    const result = await upsert('newsItem', legacyId, {
      title,
      // NocoDB misspelled this column "Desciption"; both spellings existed in
      // the wild, so read either.
      description: row.Desciption || row.Description || '',
      url: row.URL || row.Url || '',
      image,
      order: row.Order ?? 0,
      isVisible: true,
    })

    stats[result.action === 'created' ? 'created' : 'updated'] += 1
    console.log(`  ${result.action} ${title} (${i + 1}/${rows.length})`)
  }
  console.log(`  -> ${JSON.stringify(stats)}`)
}

/* -------------------------------------------------------------------- main */

const RUNNERS = {
  startup: migrateStartups,
  partner: migratePartners,
  networkCompany: migrateNetworkCompanies,
  newsItem: migrateNewsItems,
}

async function main() {
  console.log(`NocoDB -> Sanity migration${dryRun ? ' (DRY RUN)' : ''}`)
  console.log(`  project ${PROJECT_ID} / dataset ${DATASET}`)
  for (const [key, run] of Object.entries(RUNNERS)) {
    if (only && !only.has(key)) continue
    await run()
  }
  console.log('\ndone')
}

main().catch((error) => {
  console.error('\nmigration failed:', error)
  process.exit(1)
})
