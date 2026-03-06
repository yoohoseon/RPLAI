const token = "EAAXMCWaR9w4BQ90ECXJ6MrJtOZBdxcyCLnJuCRr3ClBovW8lz83YudcrBAMiojcCyhFsNMbZBOwGzEN536VVvLKpZB3fDPNwzkxhwafofJM30Rb7ZBrYS4jjTGQBBZAJjWOZBp2NyGAxhAl0PL8lBGQEa47uXSpuvXJWqsEdxNuGcJndsPkXHQa8rzbrJ9xJZClfP9J0NUVnQC01Cfw";

async function test() {
  const url1 = `https://graph.facebook.com/v19.0/ads_archive?access_token=${token}&ad_type=ALL&ad_reached_countries=['KR']&limit=40&search_page_ids=250311674989370`;
  const url2 = `https://graph.facebook.com/v19.0/ads_archive?access_token=${token}&ad_type=ALL&ad_reached_countries=['KR']&limit=40&search_page_ids=250311674989370&search_terms=${encodeURIComponent("라네즈")}`;
  const url3 = `https://graph.facebook.com/v19.0/ads_archive?access_token=${token}&ad_type=ALL&ad_reached_countries=['KR']&limit=40&search_page_ids=250311674989370&search_terms=%27%27`;

  console.log(url1);

  const r1 = await fetch(url1);
  const d1 = await r1.json();
  console.log("No search_terms:", d1.data ? d1.data.length : d1);

  const r2 = await fetch(url2);
  const d2 = await r2.json();
  console.log("search_terms=라네즈:", d2.data ? d2.data.length : d2);

  const r3 = await fetch(url3);
  const d3 = await r3.json();
  console.log("search_terms='':", d3.data ? d3.data.length : d3);
}
test();
