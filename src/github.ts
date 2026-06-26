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
    throw new GitHubError("GitHub API rate limit exceeded, try again later", 429);
  }

  const json = await res.json();

  if (json.errors?.length) {
    const first = json.errors[0];
    // GitHub reports an unknown login as a NOT_FOUND GraphQL error rather than
    // a null user, so surface it as a 404 instead of a generic upstream error.
    if (first.type === "NOT_FOUND") {
      throw new GitHubError(`User "${username}" not found`, 404);
    }
    throw new GitHubError(first.message, 502);
  }
  if (!json.data?.user) {
    throw new GitHubError(`User "${username}" not found`, 404);
  }

  return json.data.user.contributionsCollection.contributionCalendar;
}
