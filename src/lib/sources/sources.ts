import NovelFullLogo from '@/assets/store/novelfull-logo.png'
import { NovelSource } from './types';
import { NovelFull } from './novelfull';

export const Sources: NovelSource[] = [
    new NovelFull({
        id: 'novelfull',
        name: 'NovelFull',
        tags: ['Recommended'],
        logo: NovelFullLogo,
        url: 'https://novelfull.com'
    }),
];