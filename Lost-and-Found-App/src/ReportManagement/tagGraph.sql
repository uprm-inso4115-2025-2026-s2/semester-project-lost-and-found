create or replace function get_tag_graph(max_tags int default 10)
returns table (
    "tagName" text,
    count int
)
language sql
stable
as $$
    select trim(tag) as "tagName", count(*)::int as count
    from reports, unnest(tags) as tag
    where tag is not null and trim(tag) <> '' and lower(trim(tag)) <> 'none'
    group by trim(tag)
    order by count desc, trim(tag) asc
    limit max_tags;
$$;

-- Inlude in tagGraphService.ts
-- export interface TagGraphStat {
--     tagName: string; //the name of the tag
--     count: number; //the count of how many times the tag appears }
-- export async function getTagGraph(maxTags: number = 10): Promise<TagGraphStat[]> {
--     const {data, error} = await supabase.rpc('getTagGraph', {maxTags}); //call the getTagGraph function with the specified maxTags
--     if (error) {
--        throw new Error(error.message); //throw an error if there is an issue with the database query
--     }
--    return (data ?? []).map(tag) => ({ //map the results to the TagGraphStat interface
--        tagName: tag.tagName, //set the tagName property to the tag name
--        count: tag.count, //set the count property to the count of how many times the tag appears
--    }));