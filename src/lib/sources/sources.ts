import NovelFullLogo from '@/assets/store/novelfull-logo.png'
import { NovelFull } from './novelfull';

export const SOURCES = {
	"novelfull": new NovelFull({
		id: 'novelfull',
		name: 'NovelFull',
		tags: ['Recommended'],
		logo: NovelFullLogo,
		url: 'https://novelfull.com'
	}),
} as const;

export type SourceIDsT = keyof typeof SOURCES;
