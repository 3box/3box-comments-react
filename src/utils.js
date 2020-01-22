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
  if (comments && comments.length > 0) {
    // add the table to ease query
    let table = {};
    comments.forEach(c => {
      if (c.postId) {
        table[c.postId] = c;
      }
      c.message = decodeMessage(c.message);
    })

    // build the comments tree
    comments.forEach(c => {
      c.level = 0;
      const msg = c.message;
      if (msg.parentId) {
        // add children attribute for parent
        const parent = table[msg.parentId];
        if (!parent) {
          console.log("parent not found: probably the parent comment was deleted or not loaded successfully. The child is: ", c);
          return ;
        }
        if (!("children" in parent)) {
          parent.children = [];
        }
        parent.children.push(c);

        // add level attribute
        let node = c;
        while (node.message.parentId) {
          c.level ++;
          node = table[node.message.parentId];
        }
      }
    })

    // sort children chronologically
    comments = sortChronologically(comments)
    comments.forEach(c => {
      if (c.children && c.children.length > 0) {
        c.children = sortChronologically(c.children);
      }
    })

    // return the top level comments
    return comments.filter(c => c.level === 0);
  } else {
    return [];
  }
}

export const filterComments = (comments, category) => {
  if (comments && comments.length > 0 && category) {
    return comments.filter(c => c.message.category === category);
  } else {
    return [];
  }
}

export const encodeMessage = (category, data, parentId) => {
  if (parentId) {
    return {
      category,
      data,
      parentId
    }
  } else {
    return {
      category,
      data
    }
  }
}

export const decodeMessage = (comment) => {
  if (typeof comment === "object") {
    return comment;
  } else { // string
    try {
      return JSON.parse(comment);
    } catch(err) {
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
