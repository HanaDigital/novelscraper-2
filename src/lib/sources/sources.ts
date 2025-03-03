import NovelFullLogo from '@/assets/store/novelfull-logo.png';
import NovgoLogo from '@/assets/store/novgo-logo.png';
import LightNovelPubLogo from '@/assets/store/lightnovelpub-logo.png';
import { NovelFull } from './novelfull';
import { LightNovelPub } from "./lightnovelpub";
import { Novgo } from "./novogo";

export const SOURCES = {
	"novelfull": new NovelFull({
		id: 'novelfull',
		name: 'NovelFull',
		tags: ['Recommended'],
		logo: NovelFullLogo,
		url: 'https://novelfull.com'
	}),
	"novgo": new Novgo({
		id: 'novgo',
		name: 'Novgo',
		tags: ['Chinese, Korean'],
		logo: NovgoLogo,
		url: 'https://novogo.com'
	}),
	"lightnovelpub": new LightNovelPub({
		id: 'lightnovelpub',
		name: 'LightNovelPub',
		tags: ['Japanese'],
		logo: LightNovelPubLogo,
		url: 'https://www.lightnovelpub.com'
	})
} as const;

export type SourceIDsT = keyof typeof SOURCES;
