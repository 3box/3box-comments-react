const buildCommentsTree = (comments) => {
  comments.forEach(c => {
    const msg = c.message;
    if (!msg.parentId) return;

    let parent = table[msg.parentId];

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

    if (wasParentDeleted) deletedComments.push(parent)
  });

  
}