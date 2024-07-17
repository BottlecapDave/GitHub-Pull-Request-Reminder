import axios, { AxiosRequestConfig } from "axios";

export interface IGitHubRepo {
    full_name: string;
}

export interface IGitHubAuthor {
    login: string;
}

export interface IGitHubLabel {
    name: string;
}

export interface IGitHubMergeRequest {
    title: string;
    head: {
        repo: IGitHubRepo;
    };
    created_at: string;
    user: IGitHubAuthor;
    html_url: string;
    labels: IGitHubLabel[];
    draft: boolean;
}

export interface IGitHubMergeRequestRequest {
    repos: string[];
    includeWorkInProgress: boolean;
    includeDraft: boolean;
    mandatoryLabels: string[];
    excludedLabels: string[];
}

const pageSize = 30;

export class GitHubService {
    async getMergeRequests(accessToken: string, request: IGitHubMergeRequestRequest) {
        const requestConfig: AxiosRequestConfig = {
            headers: {
                'Accept': 'application/vnd.github+json',
                Authorization: `Bearer ${accessToken}`,
                'X-GitHub-Api-Version': '2022-11-28',
            },
            validateStatus: () => true, // Make sure we always return
        };

        const allRequests: IGitHubMergeRequest[] = [];
        for (const repo of request.repos) {
            let page = 1;
            let hasMoreItems = true;
            while (hasMoreItems) {
                const response = await axios.get(`https://api.github.com/repos/${repo}/pulls?sort=asc&page=${page}&per_page=${pageSize}`, requestConfig);

                if (response.status === 401) {
                    throw new Error(`Not authenticated to see merge requests for repo '${repo}'`);
                }
                else if (response.status === 403) {
                    throw new Error(`Not authorised to see merge requests for repo '${repo}'`);
                }
                else if (response.status === 404) {
                    throw new Error(`Failed to find repo '${repo}'`);
                }

                const mergeRequests: IGitHubMergeRequest[] = response.data || [];
                allRequests.push(...mergeRequests.filter(mr => request.includeWorkInProgress || mr.title.toLowerCase().startsWith("wip:") === false)
                                                .filter(mr => request.includeDraft || (mr.title.toLowerCase().startsWith("draft:") === false && mr.draft == false))
                                                .filter(mr => {
                                                    if (request.mandatoryLabels.length > 0) {
                                                        for (const mandatoryLabel of request.mandatoryLabels) {
                                                            if (mr.labels.map(x => x.name).includes(mandatoryLabel) === false) {
                                                                return false;
                                                            }
                                                        }
                                                    }

                                                    return true;
                                                })
                                                .filter(mr => {
                                                    if (request.excludedLabels.length > 0) {
                                                        for (const excludedLabel of request.excludedLabels) {
                                                            if (mr.labels.map(x => x.name).includes(excludedLabel)) {
                                                                return false;
                                                            }
                                                        }
                                                    }

                                                    return true;
                                                }));

                page++;
                if (mergeRequests.length < pageSize)
                {
                    hasMoreItems = false;
                }
            }
        }

        return allRequests;
    }
}