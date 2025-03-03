import { CloudflareResolverStatus } from "@/components/cloudflare-resolver";
import Page from '@/components/page';
import { createFileRoute } from '@tanstack/react-router'
import { invoke } from "@tauri-apps/api/core";
// import initCycleTLS from 'cycletls';

export const Route = createFileRoute('/')({
	component: RouteComponent,
})

function RouteComponent() {

	const handleTest = async () => {
		const url = 'https://novgo.co/?s=doctor&post_type=wp-manga';
		const session = await fetch('http://localhost:3148/cf-clearance-scraper', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				url,
				mode: "waf-session",
			})
		}).then(res => res.json()).catch(err => { console.error(err); return null });

		if (!session || session.code != 200) return console.error(session);

		const response = await invoke<string>('fetch_html', {
			url,
			headers: {
				...session.headers,
				cookie: session.cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join('; ')
			}
		});
		console.log(response);

		// const cycleTLS = await initCycleTLS();
		// const response = await cycleTLS('https://nopecha.com/demo/cloudflare', {
		// 	body: '',
		// 	ja3: '772,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,23-27-65037-43-51-45-16-11-13-17513-5-18-65281-0-10-35,25497-29-23-24,0', // https://scrapfly.io/web-scraping-tools/ja3-fingerprint
		// 	userAgent: session.headers["user-agent"],
		// 	// proxy: 'http://username:password@hostname.com:443',
		// 	headers: {
		// 		...session.headers,
		// 		cookie: session.cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join('; ')
		// 	}
		// }, 'get');

		// console.log(response.status);
		// cycleTLS.exit().catch(err => { });
	}

	return (
		<Page>
			<CloudflareResolverStatus />
			<button onClick={handleTest}>Test</button>
		</Page>
	);
}
