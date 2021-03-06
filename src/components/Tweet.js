import React, { useState } from 'react';

import { Link } from 'react-router-dom';
import { dbService, storageService } from 'myFirebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

import 'css/Tweet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart as fillHeart,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import {
  faEdit,
  faHeart as frameHeart
} from '@fortawesome/free-regular-svg-icons';

const Tweet = ({ tweetObj, isOwner, likedUser, userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTweet, setNewTweet] = useState(tweetObj.text);

  const onDeleteClick = async () => {
    const OK = window.confirm('이 트윗을 삭제하시겠습니까?');
    if (OK) {
      await deleteDoc(doc(dbService, `tweets/${tweetObj.id}`));
    }
    if (OK && tweetObj.attachmentUrl) {
      await deleteObject(ref(storageService, tweetObj.attachmentUrl));
    }
  };

  const onToggleEditClick = () => setIsEditing(prev => !prev);
  const onNewTweetClick = event => {
    setNewTweet(event.target.value);
  };

  const onNewTweetSubmit = async event => {
    event.preventDefault();
    await updateDoc(doc(dbService, `tweets/${tweetObj.id}`), {
      text: newTweet
    });
    setIsEditing(false);
  };

  const getTweetDate = () => {
    const createdDate = new Date(tweetObj.createdAt);
    const year = createdDate.getFullYear();
    const month = createdDate.getMonth() + 1;
    const date = createdDate.getDate();
    const hours = String(createdDate.getHours()).padStart(2, '0');
    const minutes = String(createdDate.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${date} ${hours}:${minutes}`;
  };

  const onHeartClick = async () => {
    if (likedUser) {
      const filterUsers = tweetObj.likeUsers.filter(user => user !== userId);
      await updateDoc(doc(dbService, `tweets/${tweetObj.id}`), {
        likeUsers: filterUsers
      });
    }

    if (!likedUser) {
      await updateDoc(doc(dbService, `tweets/${tweetObj.id}`), {
        likeUsers: [...tweetObj.likeUsers, userId]
      });
    }
  };

  return (
    <>
      <div className="Tweet">
        {isEditing ? (
          isOwner && (
            <div className="edit-box">
              <form className="edit-form" onSubmit={onNewTweetSubmit}>
                <textarea
                  className="edit-textarea"
                  placeholder="내용을 수정하세요."
                  required
                  value={newTweet}
                  onChange={onNewTweetClick}
                />
                <div className="btn-edit-box">
                  <button className="btn-control btn-okay" type="submit">
                    확인
                  </button>
                </div>
              </form>
            </div>
          )
        ) : (
          <div className="user-tweet">
            <div className="tweet-content">
              <Link to={`/${tweetObj.creatorId}`}>
                <img
                  className="Tweet-userImg"
                  src={tweetObj.creatorImg}
                  alt="User"
                  width="50px"
                  height="50px"
                />
              </Link>
              <h3 className="Tweet-userName">{tweetObj.creatorName}</h3>
              <span className="tweet-date">{getTweetDate()}</span>
            </div>
            <h4 className="tweet-text">{tweetObj.text}</h4>
            {tweetObj.attachmentUrl && (
              <div className="selected-img-box">
                <img
                  loading="lazy"
                  className="selected-img"
                  src={tweetObj.attachmentUrl}
                  alt="Selected file"
                />
              </div>
            )}
            {tweetObj.likeUsers && (
              <div className="btn--heart__box">
                <button onClick={onHeartClick} className="btn--heart">
                  <FontAwesomeIcon
                    icon={likedUser ? fillHeart : frameHeart}
                    className="heart__icon"
                  />
                  <span className="heart__count">
                    {tweetObj.likeUsers?.length}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
        {!isEditing && isOwner && (
          <div className="btn-box">
            <button className="btn-edit" onClick={onToggleEditClick}>
              <FontAwesomeIcon icon={faEdit} size="1x" className="btn-icon" />
              <span className="visually-hidden">수정</span>
            </button>
            <button className="btn-delete" onClick={onDeleteClick}>
              <FontAwesomeIcon
                icon={faTrashAlt}
                size="1x"
                className="btn-icon"
              />
              <span className="visually-hidden">삭제</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Tweet;
