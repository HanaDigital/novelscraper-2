import NovelFullLogo from '@/assets/store/novelfull-logo.png'

export type SourceT = {
    id: string;
    name: string;
    tags: string[];
    logo: string;
    url: string;
}

export const Sources: SourceT[] = [
    {
        id: 'novelfull',
        name: 'NovelFull',
        tags: ['Recommended'],
        logo: NovelFullLogo,
        url: 'https://novelfull.com',
    },
]