import { redirect } from '@sveltejs/kit';

// The default landing page is the recommender. This route only redirects; it is
// prerendered to a static redirect (meta refresh) that works on any host.
export const prerender = true;

export function load() {
  redirect(307, '/recommend');
}
