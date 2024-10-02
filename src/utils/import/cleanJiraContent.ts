import jira2md from 'jira2md';

const prepString = (url: string) => {
  return url.replace(/_/g, 'xxyyzzUxxyyzz');
}

// Before using jira2md, cleans the text content to replace users with their GitHub credentials and deal with attachments
const cleanrJiraContent = (content: string, users: any[], i: any) => {
  let textContent = content

  // Replace Jira users with GitHub users before applying markdown conversion
  for (const user of users) {
    textContent = textContent.replace(`[~${user.jira.emailAddress}]`, `@${prepString(user.github.username)} (${prepString(user.jira.displayName)})`)
    textContent = textContent.replace(`[~${user.jira.name}]`, `@${prepString(user.github.username)} (${prepString(user.jira.displayName)})`)
    textContent = textContent.replace(`[~${user.jira.key}]`, `@${prepString(user.github.username)} (${prepString(user.jira.displayName)})`)
  }
  
  // Replace image and attachments with the new link, using a placeholder for []() to avoid breaking the markdown conversion
  if (i !== undefined && i.attachments !== undefined && i.attachments.totalCount > 0) {
    for (const attachment of i.attachments.edges) {
      // No support for filenames containing [] as it will conflict with the regexp
      if (!attachment.node.filename.includes('[') && !attachment.node.filename.includes(']')) {
        // Find and replace all file attachments
        const regexFiles = new RegExp(`\\[\\^${attachment.node.filename}\\]`, 'g');
        textContent = textContent.replace(regexFiles, `xxyyzzLBxxyyzz${prepString(attachment.node.safeFilename)}xxyyzzRBxxyyzzxxyyzzLPxxyyzz${prepString(attachment.node.remoteBackupUrl)}xxyyzzRPxxyyzz`);

        // Find and replace all image attachments (!file.png|thumbnail!)
        const regex = new RegExp(`!${attachment.node.filename}\\|.*?!`, 'g');
        textContent = textContent.replace(regex, `xxyyzzLBxxyyzz${prepString(attachment.node.safeFilename)}xxyyzzRBxxyyzzxxyyzzLPxxyyzz${prepString(attachment.node.remoteBackupUrl)}xxyyzzRPxxyyzz`);    
      }
    }
  }

  textContent = jira2md.to_markdown(textContent)

  // Hack to still be able to use jira2md but not break links
  textContent = textContent.replace(/xxyyzzUxxyyzz/g, '_')
  textContent = textContent.replace(/xxyyzzLBxxyyzz/g, '[')
  textContent = textContent.replace(/xxyyzzRBxxyyzz/g, ']')
  textContent = textContent.replace(/xxyyzzLPxxyyzz/g, '(')
  textContent = textContent.replace(/xxyyzzRPxxyyzz/g, ')')

  // If there are still {quote} left after the markdown conversion, remove them
  textContent = textContent.replace(/{quote}/g, '')

  return textContent
};

export default cleanrJiraContent;
