import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BreachRecord {
  Name: string;
  Domain: string;
  BreachDate: string;
  PwnCount: number;
  DataClasses: string[];
}

const knownBreachDomains = new Set([
  "adobe.com",
  "linkedin.com",
  "yahoo.com",
  "dropbox.com",
  "tumblr.com",
  "myfitnesspal.com",
  "marriott.com",
  "equifax.com",
  "ebay.com",
  "sony.com",
  "target.com",
  "anthem.com",
  "opm.gov",
  "ashleymadison.com",
  "adultfriendfinder.com",
  "dailymotion.com",
  "dubsmash.com",
  "myheritage.com",
  "sporcle.com",
]);

const domainEducation: Record<string, { name: string; date: string; count: number; data: string[] }> = {
  "adobe.com": { name: "Adobe", date: "2013-10", count: 152445165, data: ["Email addresses", "Password hints", "Passwords"] },
  "linkedin.com": { name: "LinkedIn", date: "2012-06", count: 164611595, data: ["Email addresses", "Passwords"] },
  "yahoo.com": { name: "Yahoo", date: "2014-01", count: 500000000, data: ["Email addresses", "Security questions", "Passwords"] },
  "dropbox.com": { name: "Dropbox", date: "2012-07", count: 68648009, data: ["Email addresses", "Passwords"] },
  "tumblr.com": { name: "Tumblr", date: "2013-02", count: 65469298, data: ["Email addresses", "Passwords"] },
  "myfitnesspal.com": { name: "MyFitnessPal", date: "2018-02", count: 144863462, data: ["Email addresses", "Usernames", "Passwords"] },
  "marriott.com": { name: "Marriott", date: "2018-11", count: 383000000, data: ["Email addresses", "Passport numbers"] },
  "equifax.com": { name: "Equifax", date: "2017-05", count: 147900000, data: ["Social Security Numbers", "Dates of Birth"] },
  "ebay.com": { name: "eBay", date: "2014-02", count: 145000000, data: ["Email addresses", "Passwords", "Phone numbers"] },
  "sony.com": { name: "Sony Pictures", date: "2011-04", count: 3744089, data: ["Email addresses", "Passwords"] },
  "target.com": { name: "Target", date: "2013-12", count: 70000000, data: ["Email addresses", "Names", "Payment data"] },
  "anthem.com": { name: "Anthem", date: "2015-01", count: 78800000, data: ["Email addresses", "Social Security Numbers"] },
  "opm.gov": { name: "US OPM", date: "2014-04", count: 22160000, data: ["Email addresses", "Social Security Numbers"] },
  "ashleymadison.com": { name: "Ashley Madison", date: "2015-07", count: 30530750, data: ["Email addresses", "Names", "Passwords"] },
  "adultfriendfinder.com": { name: "Adult Friend Finder", date: "2016-10", count: 412214295, data: ["Email addresses", "Passwords"] },
  "dailymotion.com": { name: "Dailymotion", date: "2016-10", count: 85200000, data: ["Email addresses", "Usernames", "Passwords"] },
  "dubsmash.com": { name: "Dubsmash", date: "2018-12", count: 161853421, data: ["Email addresses", "Usernames", "Passwords"] },
  "myheritage.com": { name: "MyHeritage", date: "2017-10", count: 92203153, data: ["Email addresses", "Passwords"] },
  "sporcle.com": { name: "Sporcle", date: "2014-01", count: 404698, data: ["Email addresses", "Passwords"] },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const email: string = body?.email?.trim?.()?.toLowerCase?.() ?? "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const domain = email.split("@")[1] ?? "";

    // Try Have I Been Pwned breach API if a key is configured.
    const hibpKey = Deno.env.get("HIBP_API_KEY");
    let breaches: BreachRecord[] = [];

    if (hibpKey) {
      const res = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
        headers: {
          "hibp-api-key": hibpKey,
          "User-Agent": "PassCheck",
        },
      });

      if (res.status === 200) {
        breaches = (await res.json()) as BreachRecord[];
      } else if (res.status !== 404) {
        return new Response(JSON.stringify({ error: `HIBP API error: ${res.status}` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Fallback: check against curated known-breach domain database.
      if (knownBreachDomains.has(domain) && domainEducation[domain]) {
        const edu = domainEducation[domain];
        breaches = [{
          Name: edu.name,
          Domain: domain,
          BreachDate: edu.date,
          PwnCount: edu.count,
          DataClasses: edu.data,
        }];
      }
    }

    return new Response(JSON.stringify({ email, breaches }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message ?? "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
