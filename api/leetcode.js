export default async function handler(req, res) {
  try {
    const r = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({
        query: `query {
          matchedUser(username: "superkk1991") {
            userCalendar { submissionCalendar }
            badges {
              displayName
              icon
              creationDate
            }
          }
        }`,
      }),
    });
    const json = await r.json();
    const { userCalendar, badges } = json.data.matchedUser;
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ submissionCalendar: userCalendar.submissionCalendar, badges });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
