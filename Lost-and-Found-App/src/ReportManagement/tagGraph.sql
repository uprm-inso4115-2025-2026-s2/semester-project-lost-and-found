create or replace function getTagGraph(maxTags int default 10) --create or replace function to get the tag graph data for the top tags
returns table (
    tagName text, --stores tag name as text
    count int --stores how many tags appear
)
language sql
stable
as $$
    select trim(tag) as "tagName", count(*) as count --select the tag name and count of how many times it appears
    from reports, unnest(tags) as tag --unnest the tags array to get individual tags
    where tag is not null and trim(tag) <> '' and lower(trim(tag)) <> 'none' --filter out null and empty tags
    group by trim(tag) --group by the trimmed tag name
    order by count desc, trim(tag) asc --order by count in descending order and then by tag name in ascending order
    limit maxTags; --limit the results to the specified number of top tags
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