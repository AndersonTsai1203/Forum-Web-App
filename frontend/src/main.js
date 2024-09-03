import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import * as helper from './helpers.js';

/**
 * Global variables
  1. token for authorization
  2. thread pages for pagination of threads listings
 */
let token = null;
let userId = null;
let threadNumber = 0;
/**
 * Event for switching to login page
 */
document.getElementById('login-link').addEventListener('click', () => {
  document.getElementById('page-login').style.display = 'block';
  document.getElementById('page-register').style.display = 'none';
});

/**
 * Event for switching to registration page.
 */
document.getElementById('register-link').addEventListener('click', () => {
  document.getElementById('page-register').style.display = 'block';
  document.getElementById('page-login').style.display = 'none';
});

/**
 * Event for login a user to the app
 */
document.getElementById('login-btn').addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  fetchLogin(email, password);
});

/**
 * Event for registering a new user to the app
 */
document.getElementById('register-btn').addEventListener('click', () => {
  const email = document.getElementById('register-email').value;
  const password1 = document.getElementById('register-password_1').value;
  const password2 = document.getElementById('register-password_2').value;
  const name = document.getElementById('register-name').value;

  if (password1 != password2) {
    showErrorPopup("Passwords do not match...");
  } else {
    fetchRegister(email, password1, name);
  }
});

/**
 * Event for logging out the app back to intial page
 */
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  token = null;
  helper.switchMainPage('initial');
});

/**
 * Event for closing a page
 */
document.getElementById('error-close-btn').addEventListener('click', () => {
  document.getElementById('popup-error').style.display = 'none';
});
document.getElementById('create-thread-close-btn').addEventListener('click', () => {
  document.getElementById('popup-create-thread').style.display = 'none';
});
document.getElementById('update-thread-close-btn').addEventListener('click', () => {
  document.getElementById('popup-update-thread').style.display = 'none';
});
document.getElementById('update-user-profile-close-btn').addEventListener('click', () => {
  document.getElementById('popup-update-user-profile').style.display = 'none';
});

/**
 * Event for opening a page to create a thread
 */
document.getElementById('create-thread-btn').addEventListener('click', () => {
  document.getElementById('popup-create-thread').style.display = 'block';
});

/**
 * Event for creating a new thread
 */
document.getElementById('new-thread-submit-btn').addEventListener('click', () => {
  const title = document.getElementById('new-thread-title').value;
  const isPublic = document.getElementById('new-thread-privacy').checked;
  const content = document.getElementById('new-thread-content').value;
  fetchThreadCreate(title, isPublic, content);
  document.getElementById('popup-create-thread').style.display = 'none';
});

/**
 * Event for displaying next page of threads
 */
document.getElementById('more-btn').addEventListener('click', () => {
  threadNumber += 5;
  fetchLoadThreads();
});

document.getElementById('prev-btn').addEventListener('click', () => {
  threadNumber -= 5; 
  fetchLoadThreads();
});

 /**
  * Event for loading thread details to popup update thread screen after one click
  */
 document.getElementById('thread-edit-btn').addEventListener('click', () => {
  document.getElementById('popup-update-thread').style.display = 'block';
  const title = document.getElementById('thread-title').innerText;
  document.getElementById('individual-thread-title').value = title.split(': ')[1];
  const isPublic = document.getElementById('thread-privacy').innerText;
  document.getElementById('individual-thread-privacy').value = isPublic;
  const isLock = document.getElementById('thread-lock').innerText;
  document.getElementById('individual-thread-lock').value = isLock;
  const content = document.getElementById('thread-content').innerText;
  document.getElementById('individual-thread-content').value = content.split('\n')[1];
});

/**
 * Event for saving the updated individual thread after one click
 */
document.getElementById('thread-update-btn').addEventListener('click', () => {
  const thread = document.getElementById('thread-id').innerText;
  const threadId = thread.split(': ')[1];
  const updatedTitle = document.getElementById('individual-thread-title').value; 
  const updatedIsPublic = document.getElementById('individual-thread-privacy').checked;
  const updatedIsLock = document.getElementById('individual-thread-lock').checked;
  const updatedContent = document.getElementById('individual-thread-content').value;
  fetchThreadUpdate(threadId, updatedTitle, updatedIsPublic, updatedIsLock, updatedContent);
});

/**
 * Event for deleting the individual thread after one click
 */
document.getElementById('thread-delete-btn').addEventListener('click', () => {
  const thread = document.getElementById('thread-id').innerText;
  const threadId = thread.split(': ')[1];
  fetchThreadDelete(threadId);
});

/**
 * Event for watching and unwatching the thread after one click
 */
document.getElementById('thread-like-btn').addEventListener('click', () => {
  const likeBtn = document.getElementById('thread-like-btn');
  const thread = document.getElementById('thread-id').innerText;
  const threadId = thread.split(': ')[1];
  if (likeBtn.innerText === 'Like') {
    fetchThreadLike(threadId, true);
    likeBtn.innerText = 'Unlike';
  } else {
    fetchThreadLike(threadId, false);
    likeBtn.innerText = 'Like';
  }
});

/**
 * Event for liking and unliking the thread after one click
 */
document.getElementById('thread-watch-btn').addEventListener('click', () => {
  const watchBtn = document.getElementById('thread-watch-btn');
  const thread = document.getElementById('thread-id').innerText;
  const threadId = thread.split(': ')[1];
  if (watchBtn.innerText === 'Watch') {
    fetchThreadWatch(threadId, true);
    watchBtn.innerText = 'Unwatch';
  } else {
    fetchThreadWatch(threadId, false);
    watchBtn.innerText = 'Watch';
  }
});

/**
 * Event for creating a new comment (Parent Comment) under the current displayed thread
 */
document.getElementById('thread-comment-btn').addEventListener('click', () => {
  // get the text box where the comment text will be entered in
  const screen = document.getElementById('top-level-comment-text-box');
  const commentWriter = document.createElement('div');
  commentWriter.setAttribute('id', 'comment-writer');
  commentWriter.style.margin = "5px";
  screen.appendChild(commentWriter);
  //  create textarea for inputting new comment
  const content = document.createElement('textarea');
  content.setAttribute('id', 'comment-textarea');
  commentWriter.appendChild(content);
  // create post button for later submission
  const post = document.createElement('button');
  post.setAttribute('id', 'comment-submit-btn');
  post.innerText = 'Comment';
  commentWriter.appendChild(post);
  // create cancel button to cancel writing this comment
  const cancel = document.createElement('button');
  cancel.setAttribute('id', 'comment-cancel-btn');
  cancel.innerText = 'Cancel';
  commentWriter.appendChild(cancel);

  /**
   * Event for submitting the comment content
   */
  document.getElementById('comment-submit-btn').addEventListener('click', () => {
    const content = document.getElementById('comment-textarea').value;
    const thread = document.getElementById('thread-id').innerText;
    const threadId = thread.split(': ')[1];
    fetchCommentCreate(threadId, content, null);
    screen.removeChild(commentWriter);
  });

  /**
   * Event for cancelling the comment content
   */
  document.getElementById('comment-cancel-btn').addEventListener('click', () => {
    screen.removeChild(commentWriter);
  });
});

/**
 * Event for viewing user's own profile
 */
document.getElementById('user-profile-link').addEventListener('click', () => {
  fetchUserDetails(userId);
});

/**
 * Event for submitting the updates of user information 
 */
document.getElementById('user-profile-update-btn').addEventListener('click', () => {
  const newEmail = document.getElementById('update-user-email').value;
  const newPassword = document.getElementById('update-user-password').value;
  const newName = document.getElementById('update-user-name').value;
  fetchUserProfileUpdate(newEmail, newPassword, newName, newImage)
});
/**************************************************************************************************
 * API CALL                                                                                       *
 **************************************************************************************************/
/**
 * Register a user in the app
 */
const fetchRegister = (email, password1, name) => {
  fetch('http://localhost:' + BACKEND_PORT + '/auth/register', {
	  method: 'POST',
	  headers: {
      'Content-type': 'application/json',
    },
	  body: JSON.stringify({
      email: email,
      password: password1,
      name: name
    }) 
	}).then((response) => {
    response.json().then((data) => {
      if (data.error) {
        showErrorPopup("Email is already in use...");
      } else {
        token = data.token;
        userId = data.userId;
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        helper.switchMainPage('dashboard');
      }
    });
  });
};

/**
 * Login a user to the app
 */
const fetchLogin = (email, password) => {
  fetch('http://localhost:' + BACKEND_PORT + '/auth/login', {
	  method: 'POST',
	  headers: {
      'Content-type': 'application/json',
    },
	  body: JSON.stringify({
      email: email,
      password: password
    })
	}).then((response) => {
    response.json().then((data) => {
      if (data.error) {
        showErrorPopup("Invalid Email or Password");
      } else {
        token = data.token;
        userId = data.userId;
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        helper.switchMainPage('dashboard');
      }
    });
  });
};

/**
 * Pagination for the side bar
 */
const fetchLoadThreads = () => {
  fetch('http://localhost:' + BACKEND_PORT + '/threads?start=' + threadNumber, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token
    }
  }).then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        const container = document.getElementById('threads-container')
        container.innerText = '';
        for (const threadId of data) {
          fetchSideBarThreadDetails(threadId);
        }
        if (threadNumber === 0 && data.length < 5) {
          document.getElementById('prev-btn').style.display = 'none';
          document.getElementById('more-btn').style.display = 'none';
        }
        else if (data.length < 5) {
          document.getElementById('prev-btn').style.display = 'inline-block';
          document.getElementById('more-btn').style.display = 'none';
        }
        else if (threadNumber === 0) {
          document.getElementById('prev-btn').style.display = 'none';
          document.getElementById('more-btn').style.display = 'inline-block';
        }
       
        else {
          document.getElementById('prev-btn').style.display = 'inline-block';
          document.getElementById('more-btn').style.display = 'inline-block';
        }
      }
    });
  });
};

/**
 * Show a thread's partial details 
 */
const fetchSideBarThreadDetails = (threadId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/thread?id=' + threadId, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token
    }
  }).then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        let authorId = data.creatorId;        
        let title = data.title;
        let createDate = helper.calTime(data.createdAt);
        let likes = (data.likes).length; 
        const threadList = document.createElement('div');
        threadList.setAttribute("class", 'thread-list');
        threadList.addEventListener('click', () => {
          fetchThreadDetails(data.id);
          fetchCommentsDetails(data.id)
          document.getElementById('thread-individual-screen-empty').style.display = 'none';
          document.getElementById('thread-individual-screen').style.display = 'block';
        })
        document.getElementById('threads-container').appendChild(threadList);
        const threadPartialDetails = document.createElement('article');
        threadPartialDetails.innerText = `Title: ${title}  \r\n AuthorID: ${authorId} \r\n Likes: ${likes} \r\n Date: ${createDate}`;
        threadList.appendChild(threadPartialDetails);
      }
    });
  });
}

/**
 * Create a new thread
 */
const fetchThreadCreate = (title, isPublic, content) => {
  fetch('http://localhost:' + BACKEND_PORT + '/thread', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({
      title: title,
      isPublic: isPublic,
      content: content
    }) 
  }).then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        fetchLoadThreads();
        fetchThreadDetails(data.id);
        fetchCommentsDetails(data.id)
        document.getElementById('thread-individual-screen-empty').style.display = 'none';
        document.getElementById('thread-individual-screen').style.display = 'block';
      }
    });
  });
};

/**
 * Get a thread's details
 * Display a thread details in a screen
 */
const fetchThreadDetails = (threadId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/thread?id=' + threadId, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token
    }
  }).then((response) => {
    response.json().then((data) => {
      console.log(data);
      console.log(userId);
      const container = document.getElementById('thread-details');
      // clear the old individual thread
      container.innerText = '';
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        // thread card node
        const threadCard = document.createElement('div');
        threadCard.setAttribute("id", "thread-card");
        container.appendChild(threadCard);
        // title node
        const titleNode = document.createElement('h3');
        titleNode.setAttribute('id', 'thread-title');
        titleNode.innerText = "Title: " + data.title;
        threadCard.appendChild(titleNode);
        // thread id node
        const idNode = document.createElement('span')
        idNode.setAttribute('id', 'thread-id');
        idNode.innerText = "Thread ID: " + data.id;
        threadCard.appendChild(idNode);
        // author id node
        const userNode = document.createElement('span');
        userNode.setAttribute('id', 'author-id');
        userNode.innerText = "  Author ID: " + data.creatorId;
        threadCard.appendChild(userNode);
        // content node
        const contentNode = document.createElement('article');
        contentNode.setAttribute('id', 'thread-content');
        contentNode.innerText = "Content: \r\n" + data.content;
        threadCard.appendChild(contentNode);
        // privacy node
        const privacyNode = document.createElement('div');
        privacyNode.setAttribute('id', 'thread-privacy');
        privacyNode.innerText = data.isPublic;
        threadCard.appendChild(privacyNode);
        document.getElementById('thread-privacy').style.display = 'none';
        // lock node
        const lockNode = document.createElement('div');
        lockNode.setAttribute('id', 'thread-lock');
        lockNode.innerText = data.lock;
        threadCard.appendChild(lockNode);
        document.getElementById('thread-lock').style.display = 'none';

        // side info node (date & likes & watchees)
        const sideInfoNode = document.createElement('div');
        sideInfoNode.setAttribute('id', 'thread-side-info');
        sideInfoNode.innerText = `Date: ${helper.calTime(data.createdAt)}  Likes: ${(data.likes).length}  Watchees: ${(data.watchees).length}`;
        threadCard.appendChild(sideInfoNode);

        if ((data.likes).includes(parseInt(userId))) {
          document.getElementById('thread-like-btn').innerText = 'Unlike';
        }
        else {
          document.getElementById('thread-like-btn').innerText = 'Like';
        }

        if ((data.watchees).includes(parseInt(userId))) {
          document.getElementById('thread-watch-btn').innerText = 'Unwatch';
        }
        else {
          document.getElementById('thread-watch-btn').innerText = 'Watch';
        }

        /**
         * Lock the thread
         */
        if (data.lock === true) {
          document.getElementById('thread-edit-btn').style.display = 'none';
          document.getElementById('thread-delete-btn').style.display = 'none';
          document.getElementById('thread-like-btn').style.display = 'none';
          document.getElementById('thread-watch-btn').style.display = 'none';
          document.getElementById('thread-comment-btn').style.display = 'none';
        }
        else {
          document.getElementById('thread-edit-btn').style.display = 'inline-block';
          document.getElementById('thread-delete-btn').style.display = 'inline-block';
          document.getElementById('thread-like-btn').style.display = 'inline-block';
          document.getElementById('thread-watch-btn').style.display = 'inline-block';
          document.getElementById('thread-comment-btn').style.display = 'inline-block';
        }

        /**
         * Edit and Delete Button only available to the creator
         */
        if (userId != data.creatorId) {
          document.getElementById('thread-edit-btn').style.display = 'none';
          document.getElementById('thread-delete-btn').style.display = 'none';
        }
        else {
          document.getElementById('thread-edit-btn').style.display = 'inline-block';
          document.getElementById('thread-delete-btn').style.display = 'inline-block';
        }
      }
    });
  });
};

/**
 * Update a thread
 */
const fetchThreadUpdate = (threadId, title, isPublic, lock, content) => {
  fetch('http://localhost:' + BACKEND_PORT + '/thread', {
	  method: 'PUT',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
    body: JSON.stringify({
      id: threadId,
      title: title,
      isPublic: isPublic,
      lock: lock,
      content: content
    })
	})
  .then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        document.getElementById('popup-update-thread').style.display = 'none';
        fetchThreadDetails(threadId);
        fetchLoadThreads();
      }
    });
  });
};

/**
 * Delete a thread
 */
const fetchThreadDelete = (threadId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/thread', {
	  method: 'DELETE',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
    body: JSON.stringify({
      id: threadId
    })
	}).then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        fetchLoadThreads();
        document.getElementById('thread-details').innerText = '';
        document.getElementById('thread-individual-screen-empty').style.display = 'block';
        document.getElementById('thread-individual-screen').style.display = 'none';
      }
    });
  });
};

/**
 * Like or unlike a thread
 */
const fetchThreadLike = (threadId, isLike) => {
  fetch('http://localhost:' + BACKEND_PORT + '/thread/like', {
	  method: 'PUT',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
    body: JSON.stringify({
      id: threadId,
      turnon: isLike
    })
	})
  .then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        fetchThreadDetails(threadId);
        fetchLoadThreads();
      }
    });
  });
};

/**
 * Watch or unwatch a thread
 */
const fetchThreadWatch = (threadId, isWatch) => {
  fetch('http://localhost:' + BACKEND_PORT + '/thread/watch', {
	  method: 'PUT',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
    body: JSON.stringify({
      id: threadId,
      turnon: isWatch
    })
	})
  .then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        fetchThreadDetails(threadId);
      }
    });
  });
};

/**
 * Get comments and details
 */
const fetchCommentsDetails = (threadId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/comments?threadId=' + threadId, {
	  method: 'GET',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
	})
  .then((response) => {
    response.json().then((data) => {
      console.log(data);
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        const container = document.getElementById('all-comments-container');
        container.innerText = ' ';        
        data.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
        for (const comment of data) {
          if (comment.parentCommentId === null) {
            /**
             * Display as parent node
             */
            // get the top level node
            // new parent node
            const parentNode = document.createElement('div');
            parentNode.setAttribute("id", `comment-${comment.id}`);
            parentNode.style.margin = "10px";
            container.insertBefore(parentNode, container.children[0]);
            // creator node
            const creatorNode = document.createElement('div');
            creatorNode.setAttribute('id', `comment-creator-${comment.creatorId}`)
            parentNode.appendChild(creatorNode);
            // content node
            const contentNode = document.createElement('article');
            contentNode.setAttribute('id', `comment-${comment.id}-content`);
            contentNode.innerText = comment.content;
            parentNode.appendChild(contentNode);
            // side info node (time difference & likes)
            const sideInfoNode = document.createElement('div');
            sideInfoNode.setAttribute('id', 'comment-side-info');        
            sideInfoNode.innerText = "Date: " + helper.calTime(comment.createdAt) + "  Likes: " + (comment.likes).length;
            parentNode.appendChild(sideInfoNode);

            // edit button: for like or unlike the comment
            const editBtn = document.createElement('button');
            editBtn.setAttribute('id', `comment-${comment.id}-edit-btn`);
            editBtn.innerText = 'Edit';
            parentNode.appendChild(editBtn);
            // like button: for like or unlike the comment
            const likeBtn = document.createElement('button');
            likeBtn.setAttribute('id', `comment-${comment.id}-like-btn`);
            likeBtn.innerText = 'Like';
            parentNode.appendChild(likeBtn);
            // comment button: for open a new textbox to write a new comment below
            const commentBtn = document.createElement('button');
            commentBtn.setAttribute('id', `comment-${comment.id}-submit-btn`);
            commentBtn.innerText = 'Reply';
            parentNode.appendChild(commentBtn);
            // container for putting child nodes
            const childNodesContainer = document.createElement('div');
            childNodesContainer.setAttribute('id', `comment-${comment.id}-child-nodes-container`);
            childNodesContainer.style.margin = '30px';
            parentNode.appendChild(childNodesContainer);

            if (parseInt(userId) != parseInt(comment.creatorId)) {
              editBtn.style.display = 'none';
            }
            else {
              editBtn.style.display = 'inline-block';
            }

             /**
              * Event for loading comment details to popup update comment screen after one click
              */
            editBtn.addEventListener('click', () => {              
              //  create textarea for inputting new comment
              const updateContent = document.createElement('textarea');
              updateContent.setAttribute('id', 'comment-textarea');
              updateContent.innerText = comment.content;
              parentNode.replaceChild(updateContent, parentNode.children[1]);
              // create post button for later submission
              const post = document.createElement('button');
              post.setAttribute('id', `update-comment-${comment.id}-submit-btn`);
              post.innerText = 'Save';
              parentNode.insertBefore(post, parentNode.children[2]);
              // create cancel button to cancel writing this comment
              const cancel = document.createElement('button');
              cancel.setAttribute('id', `update-comment-${comment.id}-cancel-btn`);
              cancel.innerText = 'Cancel';
              parentNode.insertBefore(cancel, parentNode.children[3]);
              

              /**
               * Event for saving the updated comment after one click
               */
              post.addEventListener('click', () => {
                const newContent = updateContent.value;
                fetchCommentUpdate(comment.id, newContent, threadId);
                parentNode.removeChild(updateContent);
                parentNode.removeChild(post);
                parentNode.removeChild(cancel);
              });

              /**
               * Event for cancelling the updated comment after one click
               */
              cancel.addEventListener('click', () => {
                parentNode.replaceChild(contentNode, parentNode.children[1]);
                parentNode.removeChild(post);
                parentNode.removeChild(cancel);
              });
            });

            /**
             * Event for like or unlike the comment
             */
            if ((comment.likes).includes(parseInt(userId))) {
              likeBtn.innerText = 'Unlike';
            }
            else {
              likeBtn.innerText = 'Like';
            }
            likeBtn.addEventListener('click', () => {
              if (likeBtn.innerText === 'Like') {
                fetchCommentLike(comment.id, true, threadId);
                likeBtn.innerText = 'Unlike';
              } else {
                fetchCommentLike(comment.id, false, threadId);
                likeBtn.innerText = 'Like';
              }
            });

            /**
             * Event for creating new comment (Child) to the comment (Parent)
             */
            commentBtn.addEventListener('click', () => {
              // get the text box where the comment text will be entered in
              const commentWriter = document.createElement('div');
              commentWriter.setAttribute('id', 'comment-writer');
              commentWriter.style.margin = "5px";
              parentNode.insertBefore(commentWriter, parentNode.lastChild);
              //  create textarea for inputting new comment
              const content = document.createElement('textarea');
              content.setAttribute('id', 'comment-textarea');
              commentWriter.appendChild(content);
              // create post button for later submission
              const post = document.createElement('button');
              post.setAttribute('id', 'comment-submit-btn');
              post.innerText = 'Comment';
              commentWriter.appendChild(post);
              // create cancel button to cancel writing this comment
              const cancel = document.createElement('button');
              cancel.setAttribute('id', 'comment-cancel-btn');
              cancel.innerText = 'Cancel';
              commentWriter.appendChild(cancel);

              /**
               * Event for submitting the comment content
               */
              document.getElementById('comment-submit-btn').addEventListener('click', () => {
                const content = document.getElementById('comment-textarea').value;
                const thread = document.getElementById('thread-id').innerText;
                const threadId = thread.split(': ')[1];
                fetchCommentCreate(threadId, content, comment.id);
                parentNode.removeChild(commentWriter);
              });

              /**
               * Event for cancelling the comment content
               */
              document.getElementById('comment-cancel-btn').addEventListener('click', () => {
                parentNode.removeChild(commentWriter);
              });
            });
          } else {
            /**
             * Display as child node
             */
            // get the parent node
            const parentNode = document.getElementById(`comment-${comment.parentCommentId}-child-nodes-container`)
            // new child node
            const childNode = document.createElement('div');
            childNode.setAttribute("id", `comment-${comment.id}`);
            parentNode.insertBefore(childNode, parentNode.children[0]);
            // creator node
            const creatorNode = document.createElement('div');
            creatorNode.setAttribute('id', `comment-${comment.creatorId}`)
            childNode.appendChild(creatorNode);
            // content node
            const contentNode = document.createElement('article');
            contentNode.setAttribute('id', 'comment-content');
            contentNode.innerText = comment.content;
            childNode.appendChild(contentNode);
            // side info node (time difference & likes)
            const sideInfoNode = document.createElement('div');
            sideInfoNode.setAttribute('id', 'comment-side-info');        
            sideInfoNode.innerText = "Date: " + helper.calTime(comment.createdAt) + "  Likes: " + (comment.likes).length;
            childNode.appendChild(sideInfoNode);
            // edit button: for like or unlike the comment
            const editBtn = document.createElement('button');
            editBtn.setAttribute('id', `comment-${comment.id}-edit-btn`);
            editBtn.innerText = 'Edit';
            childNode.appendChild(editBtn);
            // like button: for like or unlike the comment
            const likeBtn = document.createElement('button');
            likeBtn.setAttribute('id', `comment-${comment.id}-like-btn`);
            likeBtn.innerText = 'Like';
            childNode.appendChild(likeBtn);
            // comment button: for open a new textbox to write a new comment below
            const commentBtn = document.createElement('button');
            commentBtn.setAttribute('id', `comment-${comment.id}-submit-btn`);
            commentBtn.innerText = 'Reply';
            childNode.appendChild(commentBtn);
            // container for putting child nodes
            const childNodesContainer = document.createElement('div');
            childNodesContainer.setAttribute('id', `comment-${comment.id}-child-nodes-container`);
            childNodesContainer.style.margin = "30px";
            childNode.appendChild(childNodesContainer);

            if (parseInt(userId) != parseInt(comment.creatorId)) {
              editBtn.style.display = 'none';
            }
            else {
              editBtn.style.display = 'inline-block';
            }

             /**
              * Event for loading comment details to popup update comment screen after one click
              */
             editBtn.addEventListener('click', () => {              
              //  create textarea for inputting new comment
              const updateContent = document.createElement('textarea');
              updateContent.setAttribute('id', 'comment-textarea');
              updateContent.innerText = comment.content;
              childNode.replaceChild(updateContent, childNode.children[1]);
              // create post button for later submission
              const post = document.createElement('button');
              post.setAttribute('id', `update-comment-${comment.id}-submit-btn`);
              post.innerText = 'Save';
              childNode.insertBefore(post, childNode.children[2]);
              // create cancel button to cancel writing this comment
              const cancel = document.createElement('button');
              cancel.setAttribute('id', `update-comment-${comment.id}-cancel-btn`);
              cancel.innerText = 'Cancel';
              childNode.insertBefore(cancel, childNode.children[3]);

              /**
               * Event for saving the updated comment after one click
               */
              post.addEventListener('click', () => {
                const newContent = updateContent.value;
                fetchCommentUpdate(comment.id, newContent, threadId);
                childNode.removeChild(updateContent);
                childNode.removeChild(post);
                childNode.removeChild(cancel);
              });

              /**
               * Event for cancelling the updated comment after one click
               */
              cancel.addEventListener('click', () => {
                childNode.replaceChild(contentNode, childNode.children[1]);
                childNode.removeChild(post);
                childNode.removeChild(cancel);
              });
            });

            /**
             * Event for like or unlike the comment
             */
            if ((comment.likes).includes(parseInt(userId))) {
              likeBtn.innerText = 'Unlike';
            }
            else {
              likeBtn.innerText = 'Like';
            }
            likeBtn.addEventListener('click', () => {
              if (likeBtn.innerText === 'Like') {
                fetchCommentLike(comment.id, true, threadId);
                likeBtn.innerText = 'Unlike';
              } else {
                fetchCommentLike(comment.id, false, threadId);
                likeBtn.innerText = 'Like';
              }
            });

            /**
             * Event for creating new comment (Child) to the comment (Parent)
             */
            commentBtn.addEventListener('click', () => {
              // get the text box where the comment text will be entered in
              const commentWriter = document.createElement('div');
              commentWriter.setAttribute('id', 'comment-writer');
              commentWriter.style.margin = "5px";
              childNode.insertBefore(commentWriter, childNode.lastChild);
              //  create textarea for inputting new comment
              const content = document.createElement('textarea');
              content.setAttribute('id', 'comment-textarea');
              commentWriter.appendChild(content);
              // create post button for later submission
              const post = document.createElement('button');
              post.setAttribute('id', 'comment-submit-btn');
              post.innerText = 'Comment';
              commentWriter.appendChild(post);
              // create cancel button to cancel writing this comment
              const cancel = document.createElement('button');
              cancel.setAttribute('id', 'comment-cancel-btn');
              cancel.innerText = 'Cancel';
              commentWriter.appendChild(cancel);

              /**
               * Event for submitting the comment content
               */
              document.getElementById('comment-submit-btn').addEventListener('click', () => {
                const content = document.getElementById('comment-textarea').value;
                const thread = document.getElementById('thread-id').innerText;
                const threadId = thread.split(': ')[1];
                fetchCommentCreate(threadId, content, comment.id);
                childNode.removeChild(commentWriter);
              });

              /**
               * Event for cancelling the comment content
               */
              document.getElementById('comment-cancel-btn').addEventListener('click', () => {
                childNode.removeChild(commentWriter);
              });
            });
          }
        }
      }
    });
  });
};

/**
 * Create a new comment
 */
const fetchCommentCreate = (threadId, content, parentCommentId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/comment', {
	  method: 'POST',
	  headers: {
        'Content-type': 'application/json',
        'Authorization': token
      },
	  body: JSON.stringify({
      content: content,
      threadId: threadId,
      parentCommentId: parentCommentId
    })
	})
  .then((response) => {
    response.json().then((data) => {
      console.log(data)
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        fetchCommentsDetails(threadId);
      }
    });
  });
};

/**
 * Update a comment
 */
const fetchCommentUpdate = (commentId, content, threadId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/comment', {
	  method: 'PUT',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
    body: JSON.stringify({
      id: commentId,
      content: content
    })
	})
  .then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        fetchLoadThreads()
        fetchThreadDetails(threadId);
        fetchCommentsDetails(threadId);
      }
    });
  });
};

/**
 * Like or unlike a comment
 */
const fetchCommentLike = (commentId, isLike, threadId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/comment/like', {
	  method: 'PUT',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
    body: JSON.stringify({
      id: commentId,
      turnon: isLike
    })
	})
  .then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        fetchLoadThreads()
        fetchThreadDetails(threadId);
        fetchCommentsDetails(threadId);
      }
    });
  });
};

/**
 * Get the details of the specifice user
 */
const  fetchUserDetails = (ownerId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/user?userId=' + ownerId, {
	  method: 'GET',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
	})
  .then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        const container = document.getElementById('popup-user-profile');
        container.innerText = ' ';
        container.style.display = 'block';
        const closeBtn = document.createElement('button');
        closeBtn.setAttribute('id', 'user-profile-close-btn');
        closeBtn.innerText = "X";
        container.appendChild(closeBtn);

        /**
         * Event for closing the user profile page
         */
        closeBtn.addEventListener('click', () => {
          document.getElementById('popup-user-profile').style.display = 'none';
        });
        
        // user image node
        const userImageNode = document.createElement('img');
        userImageNode.setAttribute('id', `profile-user-image`);
        userImageNode.src = data.image;
        container.appendChild(userImageNode);
        // user id node 
        const userIdNode = document.createElement('div');
        userIdNode.setAttribute('id', `profile-user-id`);
        userIdNode.innerText = "User ID:  " + data.id;
        container.appendChild(userIdNode);
        // user email node
        const userEmailNode = document.createElement('div');
        userEmailNode.setAttribute('id', `profile-user-email`);
        userEmailNode.innerText = "User Email:  " + data.email;
        container.appendChild(userEmailNode);
        // user name node
        const userNameNode = document.createElement('div');
        userNameNode.setAttribute('id', `profile-user-id-name`);
        userNameNode.innerText = "User Name  " + data.name;
        container.appendChild(userNameNode);
        
        let userCreatedThreadIds = getUserAllThreads(data.id);
        const threadContainer = document.createElement('div');
        threadContainer.setAttribute("id", "user-threads");
        container.appendChild(threadContainer);
        for (const threadId of userCreatedThreadIds) {
          fetchProfileThreadDetails(threadId);
        }

        /**
         * Event for updating user own profile after one click
         */
        if (parseInt(userId) === parseInt(ownerId)) {
          const editBtn = document.createElement('button');
          editBtn.setAttribute('id', `edit-user-${data.id}-profile`);
          editBtn.innerText = "Edit"
          container.appendChild(editBtn)

          /**
           * Event for updating user profile
           */
          editBtn.addEventListener('click', () => {
            document.getElementById('popup-update-user-profile').style.display = 'block';
            document.getElementById('update-user-email').value = data.email;
            document.getElementById('update-user-password').value = data.password;
            document.getElementById('update-user-name').value = data.name;
          });
        }
      }
    });
  });
};

/**
 * Get all thread ids that are created by the given user id
 * @returns an array of thread ids
 */
const getUserAllThreads = () => {
  let keepLoop = 1
  let startPage = 0;
  let threadArray = [];
  /*while (keepLoop) {
    fetch('http://localhost:' + BACKEND_PORT + '/threads?start=' + startPage, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token
      }
    }).then((response) => {
      response.json().then((data) => {
        if (data.error) {
          helper.showErrorPopup(data.error);
        } else {
          for (const threadId of data) {
            let existThreadId = fetchSearchUserOwnThread(parseInt(userId), threadId)
            threadArray.push(existThreadId);
          }
          startPage += 5;
          if (data.length < 5) {
            keepLoop = 0;
          }
        }
      });
    });
  }*/
  return threadArray;
};

const fetchSearchUserOwnThread = (userId, threadId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/thread?id=' + threadId, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token
    }
  }).then((response) => {
    response.json().then((data) => {
      if (userId === parseInt(data.creatorID)) {
        return threadId;
      }
    });
  });
}

const fetchProfileThreadDetails  = (threadId) => {
  fetch('http://localhost:' + BACKEND_PORT + '/thread?id=' + threadId, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'Authorization': token
    }
  }).then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        let authorId = data.creatorId;        
        let title = data.title;
        let createDate = helper.calTime(data.createdAt);
        let likes = (data.likes).length; 
        const threadList = document.createElement('div');
        threadList.setAttribute("class", 'thread-list');
        document.getElementById('user-threads').appendChild(threadList);
        const threadPartialDetails = document.createElement('article');
        threadPartialDetails.innerText = `Title: ${title}  \r\n AuthorID: ${authorId} \r\n Likes: ${likes} \r\n Date: ${createDate}`;
        threadList.appendChild(threadPartialDetails);
      }
    });
  });
};


/**
 * Update user's own profile
 */
const fetchUserProfileUpdate = (email, password, name, image) => {
  fetch('http://localhost:5005' + BACKEND_PORT + '/user', {
	  method: 'PUT',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
    body: JSON.stringify({
      email: email,
      password: password,
      name: name,
      image: image
    })
	})
  .then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Decide whether this user is an admin
 */
const fetchUserAdmin = (userId, isAdmin) => {
  fetch('http://localhost:5005' + BACKEND_PORT + '/user/admin', {
	  method: 'PUT',
	  headers: {
      'Content-type': 'application/json',
		  'Authorization': token
    },
    body: JSON.stringify({
      id: userId,
      turnon: isAdmin
    })
	})
  .then((response) => {
    response.json().then((data) => {
      if (data.error) {
        helper.showErrorPopup(data.error);
      } else {
        resolve(data);
      }
    });
  });
};

if (localStorage.getItem('token')) {
  token = localStorage.getItem('token');
  userId = localStorage.getItem('userId');
  helper.switchMainPage('dashboard');
  fetchLoadThreads();
} else {
  helper.switchMainPage('initial');
}

