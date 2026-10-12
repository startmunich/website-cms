import {memberStoryType} from './documents/member-story'
import {networkCompanyType} from './documents/network-company'
import {newsItemType} from './documents/news-item'
import {partnerType} from './documents/partner'
import {postType} from './documents/post'
import {startupType} from './documents/startup'
import {authorType} from './documents/author'

export const schemaTypes = [
  postType,
  authorType,
  memberStoryType,
  startupType,
  partnerType,
  networkCompanyType,
  newsItemType,
]
