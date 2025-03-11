// 在 Node.js 中使用 fetch
import fetch from 'node-fetch';

//const fetch = require('node-fetch');  // 在 Lambda 环境中使用 node-fetch

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // 通过环境变量传递 GitHub Token
const REPO_OWNER = 'gchenjiachen';  // GitHub 用户名
const REPO_NAME = 'visit-counter';  // GitHub 仓库名
const ISSUE_NUMBER = 1;  // GitHub Issue 编号

exports.handler = async function (event, context) {
  const issueUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}`;
  try {
    // 获取当前访问量
    const response = await fetch(issueUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed with status ${response.status}`);
    }

    const issueData = await response.json();
    let visitCount = parseInt(issueData.body || '0', 10);
    visitCount++;  // 增加访问量

    // 更新访问量
    const updateResponse = await fetch(issueUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: visitCount.toString(),
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update GitHub issue with status ${updateResponse.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ count: visitCount }),  // 返回更新后的访问量
    };
  } catch (error) {
    console.error('Error in visit-counter Lambda function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to update visit count: ${error.message}` }),
    };
  }
};
