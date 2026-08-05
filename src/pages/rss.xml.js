import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { metaData } from "./../config";

export async function GET(context) {
  const posts = await getCollection("blog");
  return rss({
    title: metaData.title,
    description: metaData.description,
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.slug}/`,
    })),
  });
}
