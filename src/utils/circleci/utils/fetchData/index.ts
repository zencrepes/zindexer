import axios from 'axios';

const fetchPage = async (
  endpoint: string,
  token: string,
  nextPageToken?: string,
) => {
  const serverUrl = 'https://circleci.com/api/v2/' + endpoint;
  const params =
    nextPageToken === undefined ? {} : { 'page-token': nextPageToken };
  const response = await axios({
    method: 'get',
    url: serverUrl,
    validateStatus: function(status) {
      return status >= 200 && status < 500; // default
    },
    headers: {
      'Circle-Token': token,
    },
    params,
  });
  if (response.data !== undefined) {
    return response.data;
  }
};

// Recursively fetching data
const fetchDataPagination = async (
  endpoint: string,
  token: string,
  items: Array<object>,
  nextPageToken?: string,
) => {
  const response = await fetchPage(endpoint, token, nextPageToken);
  if (response.message !== undefined) {
    console.log('MESSAGE: ' + response.message);
  }
  if (response.items === undefined) {
    console.log('No items fetched');
  } else if (response.items.length === 0) {
    console.log('No items fetched');
  } else {
    for (const newItem of response.items) {
      items.push(newItem);
    }
    console.log(
      'Total items in cache: ' +
        items.length +
        ' (fetched ' +
        response.items.length +
        ')',
    );
    if (
      response.next_page_token === null ||
      response.next_page_token === undefined
    ) {
      console.log('All items fetched, stopping');
    } else {
      await fetchDataPagination(
        endpoint,
        token,
        items,
        response.next_page_token,
      );
    }
  }
  return items;
};

export default fetchDataPagination;
