export const GITHUB_API_URL = process.env.GITHUB_API_URL || 'https://api.github.com';
export const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
export const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

// Minimum recommended scopes for full functionality (Repositories, Issues, Pull Requests, Actions, User)
export const GITHUB_DEFAULT_SCOPES = [
  'repo',
  'read:user',
  'user:email',
  'workflow',
].join(' ');

export const GITHUB_ERROR_MESSAGES: Record<number, string> = {
  401: 'GitHub authentication expired or invalid. Please reconnect your GitHub account.',
  403: 'You do not have permission to perform this GitHub action, or the API rate limit was exceeded.',
  404: 'GitHub repository or requested resource was not found.',
  409: 'GitHub reported a conflict. The branch, file, or resource state has changed on remote.',
  422: 'GitHub validation failed. The provided branch, reference, or request payload is invalid.',
  429: 'GitHub API rate limit reached. Please wait a few moments and try again.',
  500: 'GitHub API encountered an unexpected internal server error.',
  502: 'Bad gateway encountered while contacting GitHub servers.',
  503: 'GitHub is temporarily unavailable or undergoing maintenance.',
};
