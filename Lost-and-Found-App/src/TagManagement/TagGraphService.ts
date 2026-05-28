import { supabase } from "../supabaseClient";

export interface TagStat {
  tagName: string;
  count: number;
}

export async function getTagStats(maxTags: number = 10): Promise<TagStat[]> {
  const { data, error } = await supabase.rpc("get_tag_graph", { max_tags: maxTags });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((tag: { tagName: string; count: number }) => ({
    tagName: tag.tagName,
    count: tag.count,
  }));
}
