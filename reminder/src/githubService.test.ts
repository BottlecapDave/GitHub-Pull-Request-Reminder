import { GitHubService, IGitHubMergeRequest, IGitHubMergeRequestRequest } from "./githubService"

function createRequestData(): IGitHubMergeRequestRequest {
  return {
    includeDraft: true,
    includeWorkInProgress: true,
    repos: [process.env.TEST_REPO as string],
    mandatoryLabels: [],
    excludedLabels: ["dependencies"],
  }
}

function getAccessToken(): string {
  return process.env.TEST_GITHUB_ACCESS_TOKEN as string
}

function assertMergeRequest(mergeRequest: IGitHubMergeRequest) {
  expect(mergeRequest.head.repo.full_name).toEqual('BottlecapDave/GitHub-Pull-Request-Reminder');
  expect(mergeRequest.user.login === 'dependabot[bot]' || mergeRequest.user.login === 'BottlecapDave').toEqual(true);
  expect(mergeRequest.html_url.startsWith("https://github.com/BottlecapDave/GitHub-Pull-Request-Reminder/pull/")).toEqual(true);
}

function assertMergeRequests(mergeRequests: IGitHubMergeRequest[], includeWip: boolean, includeDraft: boolean) {
  expect(mergeRequests.length).toBeGreaterThanOrEqual(1);
  let wipPresent = false;
  let draftPresent = false;
  let lastMergeRequestTimestamp: Date | undefined;
  for (const mergeRequest of mergeRequests) {
    // Skip merge requests that are not for integration tests, as these might be external PRs
    if (!mergeRequest.labels.find(x => x.name === 'integration-test')) {
      continue
    } 
    
    if (mergeRequest.title.toLowerCase().includes('wip')) {
      wipPresent = true
    }

    if (mergeRequest.title.toLowerCase().includes('draft')) {
      draftPresent = true
    }

    assertMergeRequest(mergeRequest);

    const createdAt = new Date(mergeRequest.created_at);
    if (lastMergeRequestTimestamp) {
      expect(createdAt > lastMergeRequestTimestamp).toEqual(true);
    }

    lastMergeRequestTimestamp = createdAt;
  }

  expect(wipPresent).toEqual(includeWip);
  expect(draftPresent).toEqual(includeDraft);
}

describe('GitHubService', () => {
  test('when unauthenticated, then error is thrown', async () => {
    const accessToken = '';
    const request = createRequestData();
    const service = new GitHubService();
  
    await expect(service.getMergeRequests(accessToken, request))
          .rejects
          .toThrow(`Not authenticated to see pull requests for repo '${request.repos[0]}'`);
  })
  
  test('when repos does not exist, then error is thrown', async () => {
    const accessToken = getAccessToken();
    const request: IGitHubMergeRequestRequest = {
      ...createRequestData(),
      repos: ['a']
    };
    const service = new GitHubService();
  
    await expect(service.getMergeRequests(accessToken, request))
          .rejects
          .toThrow(`Failed to find repo '${request.repos[0]}'`);
  })
  
  test('when include draft is set to false, then no draft pull requests are returned', async () => {
    const accessToken = getAccessToken();
    const request: IGitHubMergeRequestRequest = {
      ...createRequestData(),
      includeDraft: false,
    };
    const service = new GitHubService();
  
    const mergeRequests = await service.getMergeRequests(accessToken, request);
    assertMergeRequests(mergeRequests, request.includeWorkInProgress, request.includeDraft);
  })
  
  test('when include draft is set to true, then draft pull requests are returned', async () => {
    const accessToken = getAccessToken();
    const request: IGitHubMergeRequestRequest = {
      ...createRequestData(),
      includeDraft: true,
    };
    const service = new GitHubService();
  
    const mergeRequests = await service.getMergeRequests(accessToken, request);
    assertMergeRequests(mergeRequests, request.includeWorkInProgress, request.includeDraft);
  })
  
  test('when include wip is set to false, then no wip pull requests are returned', async () => {
    const accessToken = getAccessToken();
    const request: IGitHubMergeRequestRequest = {
      ...createRequestData(),
      includeWorkInProgress: false,
    };
    const service = new GitHubService();
  
    const mergeRequests = await service.getMergeRequests(accessToken, request);
    assertMergeRequests(mergeRequests, request.includeWorkInProgress, request.includeDraft);
  })
  
  test('when include wip is set to true, then wip pull requests are returned', async () => {
    const accessToken = getAccessToken();
    const request: IGitHubMergeRequestRequest = {
      ...createRequestData(),
      includeWorkInProgress: true,
    };
    const service = new GitHubService();
  
    const mergeRequests = await service.getMergeRequests(accessToken, request);
    assertMergeRequests(mergeRequests, request.includeWorkInProgress, request.includeDraft);
  })
  
  test('when mandatory label is specified but not present, then no pull requests are returned', async () => {
    const accessToken = getAccessToken();
    const request: IGitHubMergeRequestRequest = {
      ...createRequestData(),
      mandatoryLabels: ['non-existent']
    };
    const service = new GitHubService();
  
    const mergeRequests = await service.getMergeRequests(accessToken, request);
    
    expect(mergeRequests.length).toEqual(0);
  })
  
  test('when mandatory label is specified, then only pull requests with the labels are returned', async () => {
    const accessToken = getAccessToken();
    const request: IGitHubMergeRequestRequest = {
      ...createRequestData(),
      mandatoryLabels: ['test-label', 'test-label-2']
    };
    const service = new GitHubService();
  
    const mergeRequests = await service.getMergeRequests(accessToken, request);
    
    expect(mergeRequests.length).toEqual(1);
    assertMergeRequest(mergeRequests[0]);
    expect(mergeRequests[0].title).toEqual('Pull request with mandatory labels');
  })

  test('when excluded label is specified but not present, then pull requests are returned', async () => {
    const accessToken = getAccessToken();
    const request: IGitHubMergeRequestRequest = {
      ...createRequestData(),
      excludedLabels: ['non-existent']
    };
    const service = new GitHubService();
  
    const mergeRequests = await service.getMergeRequests(accessToken, request);
    
    assertMergeRequests(mergeRequests, request.includeWorkInProgress, request.includeDraft);
  })
  
  test('when excluded label is specified, then only pull requests without the excluded labels are returned', async () => {
    const accessToken = getAccessToken();
    const request: IGitHubMergeRequestRequest = {
      ...createRequestData(),
      excludedLabels: ['test-label']
    };
    const service = new GitHubService();
  
    const mergeRequests = await service.getMergeRequests(accessToken, request);

    for (const mergeRequest of mergeRequests) {
      for (const excludedLabel of request.excludedLabels) {
        expect(mergeRequest.labels.map(x => x.name).includes(excludedLabel)).toEqual(false);
      }
    }
  })
})