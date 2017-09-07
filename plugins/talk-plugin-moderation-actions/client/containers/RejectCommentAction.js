import React from 'react';
import {getErrorMessages} from 'plugin-api/beta/client/utils';
import {withSetCommentStatus} from 'plugin-api/beta/client/hocs';
import {notify} from 'plugin-api/beta/client/actions/notification';
import RejectCommentAction from '../components/RejectCommentAction';

class RejectCommentActionContainer extends React.Component {

  rejectComment = async () => {
    const {setCommentStatus, comment} = this.props;

    try {
      const result = await setCommentStatus({
        commentId: comment.id,
        status: 'REJECTED'
      });

      if (result.data.setCommentStatus.errors) {
        throw result.data.setCommentStatus.errors;
      }
      
    } catch (err) {
      notify('error', getErrorMessages(err));
    }
  }

  render() {
    return <RejectCommentAction rejectComment={this.rejectComment}/>
  }
}

export default withSetCommentStatus(RejectCommentActionContainer);
