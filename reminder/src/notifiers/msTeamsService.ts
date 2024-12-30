import { IGitHubMergeRequest } from "../githubService";
import { formatDistance } from 'date-fns';
import axios, { AxiosRequestConfig } from "axios";

export interface IMsTeamsConfig {
    webhookUrl: string;
}

export class MsTeamsService {
    async sendReminder(config: IMsTeamsConfig, mergeRequests: IGitHubMergeRequest[]) {
      const body = [];
      body.push(
        {
          "type": "TextBlock",
          "text": "Merge Requests",
          "style": "heading"
        },
        {
          "type": "TextBlock",
          "text": "Looks like there are some open merge requests...",
          "wrap": true
        }
      );

      const groupedMergeRequests = mergeRequests.reduce(function(rv: Record<string, IGitHubMergeRequest[]>, x: IGitHubMergeRequest) {
        (rv[x.head.repo.full_name] = rv[x.head.repo.full_name] || []).push(x);
        return rv;
      }, {});

      const groupedKeys: string[] = Object.keys(groupedMergeRequests);
      for (const key of groupedKeys) {
        body.push({
          "type": "TextBlock",
          "text": key,
          "wrap": true,
          "weight": "Bolder"
      },);

        for (const request of groupedMergeRequests[key]) {
          body.push({
            "type": "ColumnSet",
            "columns": [
              {
                "type": "Column",
                "width": 60,
                "items": [
                  {
                    "type": "TextBlock",
                    "text": request.title,
                    "wrap": true
                  }
                ]
              },
              {
                "type": "Column",
                "width": 40,
                "items": [
                  {
                    "type": "TextBlock",
                    "text": `Opened ${formatDistance(request.created_at, new Date())} ago by ${request.user.login}`,
                    "wrap": true
                  }
                ]
              }
            ],
            "selectAction": {
              "type": "Action.OpenUrl",
              "url": request.html_url
            }
          });
        }
      }

      const requestConfig: AxiosRequestConfig = {
          validateStatus: () => true, // Make sure we always return
      };

      await axios.post(
          config.webhookUrl,
          {
            "type": "message",
            "attachments": [
                {
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "contentUrl": null,
                    "content": {
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                        "type": "AdaptiveCard",
                        "version": "1.2",
                        "body": body
                    }
                }
            ]
          },
          requestConfig
      );
    }
}