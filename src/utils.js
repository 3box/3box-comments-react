export const shortenEthAddr = (str) => {
  const shortenStr = str && `${str.substring(0, 5)}...${str.substring(str.length - 5, str.length)}`;
  return shortenStr;
};

export const timeSince = (date) => {

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval === 1) return interval + " year";
  if (interval > 1) return interval + " years";

  interval = Math.floor(seconds / 2592000);
  if (interval === 1) return interval + " month";
  if (interval > 1) return interval + " months";

  interval = Math.floor(seconds / 86400);
  if (interval === 1) return interval + " day";
  if (interval > 1) return interval + " days";

  interval = Math.floor(seconds / 3600);
  if (interval === 1) return interval + " hour";
  if (interval > 1) return interval + " hours";

  interval = Math.floor(seconds / 60);
  if (interval === 1) return interval + " minute";
  if (interval > 1) return interval + " minutes";

  return Math.floor(seconds) + " seconds";
}

export const checkIsMobileDevice = () => {
  return ((window && typeof window.orientation !== "undefined")) || (navigator && navigator.userAgent.indexOf('IEMobile') !== -1);
};

export const sortChronologically = (threadPosts) => {
  const updatedThreadPosts = threadPosts.sort((a, b) => {
    a = a.timestamp;
    b = b.timestamp;
    return a > b ? -1 : a < b ? 1 : 0;
  });

  return updatedThreadPosts;
}

// assume all the comments are loaded
export const reorderComments = (comments) => {
  if (!comments || comments.length === 0) return [];

  // if (comments && comments.length > 0) {
  // add the table to ease query
  let table = {};
  comments.forEach(c => {
    if (c.postId) table[c.postId] = c;

    c.message = decodeMessage(c.message);
  });

  let deletedComments = [];
  // build the comments tree
  comments.forEach(c => {
    console.log('originalcomment', c)
    const msg = c.message;
    if (!msg.parentId) return;

    let parent = table[msg.parentId];
    let wasParentDeleted;
    if (!parent) {
      // parent was deleted
      let parentId;
      if (c.message.nestLevel === 2) parentId = c.message.grandParentId;

      wasParentDeleted = true;
      parent = {
        postId: msg.parentId,
        author: undefined,
        message: {
          category: 'deleted',
          parentId,
          nestLevel: c.message.nestLevel - 1
        },
        timestamp: c.timestamp,
      };
      table[msg.parentId] = parent;
    }

    if (!("children" in parent)) parent.children = [];
    parent.children.push(c);

    if (wasParentDeleted) deletedComments.push(parent)
  });
  console.log('deletedComments', deletedComments.length)

  let mergedComments;
  let deletedComments2 = [];
  if (deletedComments.length) {
    deletedComments.forEach(c => {
      const msg = c.message;
      if (!msg.parentId) return;

      let parent = table[msg.parentId];
      console.log('parentparent', parent)
      let wasParentDeleted;
      if (!parent) {
        // parent was deleted
        let parentId;
        if (c.message.nestLevel === 1) parentId = c.message.grandParentId;

        wasParentDeleted = true;
        parent = {
          postId: msg.parentId,
          author: undefined,
          message: {
            category: 'deleted',
            parentId,
            nestLevel: c.message.nestLevel - 1
          },
          timestamp: c.timestamp,
        };
        table[msg.parentId] = parent;
      }

      if (!("children" in parent)) parent.children = [];
      parent.children.push(c);

      if (wasParentDeleted) deletedComments2.push(parent)
    });
    // iterate through deleted comments
    // find deleted comments that have a parentId
    // include it as a child of the parent
    // if the parent doesnt exist, create it
  }
  mergedComments = comments.concat(deletedComments).concat(deletedComments2);

  // sort children chronologically
  const updatedComments = sortChronologically(mergedComments);
  updatedComments.forEach(c => {
    if (c.children && c.children.length > 0) {
      c.children = sortChronologically(c.children);
    }
  });

  console.log('commentscomments', updatedComments)

  // return the top level comments
  return updatedComments.filter(c => c.message.nestLevel === 0);
}

export const filterComments = (comments, category, deleted) => {
  if (comments && comments.length > 0 && category) {
    return comments.filter(c => (c.message.category === category || c.message.category === deleted));
  } else {
    return [];
  }
}

export const encodeMessage = (category, data, parentId, nestLevel, grandParentId) => {
  if (parentId) {
    return {
      category,
      data,
      nestLevel,
      parentId,
      grandParentId
    }
  } else {
    return {
      category,
      data,
      nestLevel,
      grandParentId
    }
  }
}

export const decodeMessage = (comment) => {
  if (typeof comment === "object") {
    return comment;
  } else { // string
    try {
      return JSON.parse(comment);
    } catch (err) {
      return {
        category: "comment",
        data: comment,
        parentId: null
      }
    }
  }
}

export const aggregateReactions = (reactions) => {
  if (reactions && reactions.length > 0) {
    let table = {};
    reactions.forEach((r) => {
      const emoji = r.message.data;
      if (emoji in table) {
        table[emoji].count += 1;
        table[emoji].items.push(r);
      } else {
        table[emoji] = {
          count: 1,
          items: [r]
        };
      }
    })
    return table;
  } else {
    return {}
  }
}

export const REPLIABLE_COMMENT_LEVEL_MAX = 2;
export const REPLY_THREAD_SHOW_COMMENT_COUNT = 5;