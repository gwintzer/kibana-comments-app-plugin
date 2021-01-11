import axios from 'axios';

const apiPrefix = "../api/kibana-comments-plugin";

axios.defaults.headers.post['kbn-xsrf']   = "reporting";
axios.defaults.headers.put['kbn-xsrf']    = "reporting";
axios.defaults.headers.delete['kbn-xsrf'] = "reporting";

export async function loadIndices() {

  try {

    const listIndices = await axios.get(apiPrefix + '/index');

    return {
      status: true,
      data: listIndices.data.data.map((i) => ({ value: i.index, text: i.index }))
    }
  }
  catch(e) {
    return {
      ...e,
      status: false
    }
  }

}

export async function createDefaultIndex() {

  try {

    await axios.put(apiPrefix + '/index');

    return {
      status: true
    }
  }
  catch(e) {
    return {
      ...e,
      status: false
    }
  }

}

export async function findComments({index, pageIndex, pageSize, sortField, sortDirection}) {

  try {

    // TODO filter by index ?
    const listComments = await axios.get(apiPrefix + '/comment', {
      params: {
        pageIndex,
        pageSize,
        sortField,
        sortDirection,
      }
    });

    return {
      status: true,
      data: {
        pageOfItems: listComments.data.items,
        totalItemCount: listComments.data.total.value,
      }
    }
  }
  catch(e) {
    return {
      ...e,
      status: false
    }
  }

}


// Check the index name
// see https://stackoverflow.com/questions/41585392/what-are-the-rules-for-index-names-in-elastic-search
// TODO
export function checkIndexName(indexName) {

  return {
    indexName,
    status: true,
    text: "" // explain when index is not valid
  }
}

export async function createIndex(indexName) {

    try {

      if (!indexName) {
        throw {
          text: 'Index name cannot be empty',
          type: 'danger'
        };

      }

      let checkIndex = checkIndexName(indexName)
      if (!checkIndex.status)
      {
        throw {
          text: 'Index name is not valid. Reason: ' + checkIndex.text,
          type: 'danger'
        };
      }

      // Perform JSONP request.
      const res = await axios.put(apiPrefix + '/index/' + indexName,
          {},
          {
            headers: {
              'Content-Type': 'application/json'
          }
      });

      // ok if acknowledged or if the index already exists, else throw error...
      if (!res.data.data.acknowledged && res.data.data.error.type !== "resource_already_exists_exception") {

        throw {
          text: 'An error occured when processing your request. Reason: ' + res.data.error.reason,
          type: 'danger',
          err: res
        };
      }

      return {
        indexName,
        status: true
      }

    }
    catch(e) {

      return {
        ...e,
        indexName,
        status: false
      }
    }

}

export async function submitComment(indexName, date, comment) {

  try {
    var data = {
      index: indexName,
      comment: {
        date : date,
        body : comment,
      }
    };

    // Perform JSONP request.
    const res = await axios.put(apiPrefix + '/comment',
      data,
      { headers: { 'Content-Type': 'application/json' }}
    );

    // ok if acknowledged or if the index already exists, else throw error...
    if (res.data.data.result !== "created") {

      throw {
        text: 'An error occured when saving your comment. Reason: ' + res.data.error,
        type: 'danger',
        err: res
      };
    }

    return {
      indexName,
      status: true
    }

  }
  catch(e) {

    return {
      ...e,
      indexName,
      status: false
    }
  }

}

export async function deleteComments(commentsToDelete) {

  // await axios.delete(apiPrefix + '/comment/', mapOfCommentIds)

  const pArray = commentsToDelete.map(async comment => {

    return await axios.delete(apiPrefix + '/comment/' + comment.index + '/' + comment.id);
  });

  const comments = await Promise.all(pArray);
  // ... do some stuff
  return comments;

}
