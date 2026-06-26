export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
  }
}

const GITHUB_GRAPHQL = "https://api.github.com/graphql";

// GitHub usernames: 1–39 chars, alphanumeric or single hyphens, no leading/
// trailing/consecutive hyphens. Validating here keeps malformed input out of
// the GraphQL call entirely.
const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_RE.test(username);
}

const CONTRIBUTION_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            color
          }
        }
      }
    }
  }
}`;

export async function fetchContributions(
  username: string
): Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new GitHubError("GITHUB_TOKEN not set", 500);
  }

  if (!isValidUsername(username)) {
    throw new GitHubError(`Invalid GitHub username: "${username}"`, 400);
  }

  let res: Response;
  try {
    res = await fetch(GITHUB_GRAPHQL, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "GitWall/1.0",
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { username },
      }),
    });
  } catch (err) {
    throw new GitHubError(
      err instanceof Error ? err.message : "Network error reaching GitHub",
      502
    );
  }

  if (res.status === 401) {
    throw new GitHubError("GitHub token is invalid or expired", 500);
  }

  if (res.status === 403 || res.status === 429) {
    // A real rate-limit is signalled by an exhausted quota header (or a 429).
    // GitHub also returns 403 for other reasons (missing token scope, abuse
    // detection, blocked IP) — those need a different message, not "try again".
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (res.status === 429 || remaining === "0") {
      throw new GitHubError(
        "GitHub API rate limit exceeded, try again later",
        429
      );
    }
    let message =
      "GitHub denied the request — check that the token has the read:user scope";
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* keep the default message if the 403 body is not JSON */
    }
    throw new GitHubError(message, 403);
  }

  // GitHub can return a non-JSON body (HTML gateway/error page during an
  // outage). Guard the parse so it surfaces as a clear upstream error rather
  // than an opaque "Unexpected token <" 500.
  let json;
  try {
    json = await res.json();
  } catch {
    throw new GitHubError(
      `GitHub returned an unexpected response (HTTP ${res.status})`,
      502
    );
  }

  if (json.errors?.length) {
    const first = json.errors[0];
    // An unknown/suspended login comes back as a GraphQL error. GitHub usually
    // tags it NOT_FOUND, but also match the message text so a plain typo always
    // surfaces as a 404 rather than a generic upstream error.
    if (first.type === "NOT_FOUND" || /could not resolve to a user/i.test(first.message ?? "")) {
      throw new GitHubError(`User "${username}" not found`, 404);
    }
    throw new GitHubError(first.message, 502);
  }
  if (!json.data?.user) {
    throw new GitHubError(`User "${username}" not found`, 404);
  }

  return json.data.user.contributionsCollection.contributionCalendar;
}
