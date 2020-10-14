/* eslint-disable no-loop-func */

import React from 'react';
import { connect } from 'react-redux';
import CKEditor from 'ckeditor4-react';
import * as CommonIcon from 'components/icons/common';
import { updateExam, callApiExam } from 'actions/examActions';
import { withRouter } from 'react-router';
import AdminContent from 'components/body/layout/AdminContent';
import { getObjLevel, getObjSubject, subjects2 } from 'actions/common/getInfo';
import {
  changeHeader,
} from 'actions/examActions';
import './style.scss';
const total = 100;
const MODE = ['Dễ', 'Trung bình', 'Khó'];

class QuestionDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentQuestion: {
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: ['option1'],
      },
      filter: {
        mode: 'Dễ',
        grade: 'Lớp 10',
        subject: 'Toán',
      },
    };
  }

  componentDidMount() {
    const { match: { params: { id } } } = this.props;
    const text = !id || Number(id) === 0 ? 'Thêm mới câu hỏi' : 'Chi tiết câu hỏi';
    this.props.changeHeader(text);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.callingApi && this.props.callingApi === 'QuestionDetail') {
      nextProps.history.push('/admin/question-list');
    }
    //for update
    const { question } = this.props;
    if (nextProps.question !== question) {
      const {
        id, question, option1, option2, option3, option4, correctAnswer,
        mode, grade, subject,
      } = nextProps.question;
      const correctAnswerOP = [];
      if (correctAnswer.includes(option1)) {
        correctAnswer.push('option1');
      }
      if (correctAnswer.includes(option2)) {
        correctAnswer.push('option2');
      }
      if (correctAnswer.includes(option3)) {
        correctAnswer.push('option3');
      }
      if (correctAnswer.includes(option4)) {
        correctAnswer.push('option4');
      }
      this.setState(state => ({
        currentQuestion: {
          id,
          question,
          option1,
          option2,
          option3,
          option4,
          correctAnswer: correctAnswerOP,
        },
        filter: {
          mode, grade, subject,
        },
      }))
    }
  }

  onEditorChange = (evt) => {
    this.setState(state => ({
      currentQuestion: {
        ...state.currentQuestion,
        question: evt.editor.getData(),
      },
    }));
  }

  onChangeMax255 = (key, val, error) => {
    if (val && val.length >= 255) {
      this.setState(state => ({
        currentQuestion: {
          ...state.currentQuestion,
          // [error]: 'Độ dài tối đa là 255 kí tự',
        },
      }));
      return window.noti.error('Bạn nhập quá 255 kí tự');
    }
    else {
      this.setState(state => ({
        currentQuestion: {
          ...state.currentQuestion,
          [key]: val,
          // [error]: '',
        },
      }));
    }
  }

  save = (can) => {
    if (!can) return;
    const { currentQuestion, filter } = this.state;
    const correctAnswer = currentQuestion.correctAnswer.map(item => currentQuestion[item]);
    const questionDTO = {
      ...currentQuestion,
      ...filter,
      correctAnswer,
    }
    console.log("save -> questionDTO", questionDTO)
  }

  onChangeFilter = (key, val, error) => {
    if (key === 'grade') {
      return this.setState(state => ({
        filter: {
          ...state.filter,
          grade: val,
          subject: 'Toán Học',
        }
      }))
    }
    this.setState(state => ({
      filter: {
        ...state.filter,
        [key]: val,
      }
    }))
  }

  choose = (correctAnswer) => {
    this.setState(state => {
      const oldCorrectAnswer = state.currentQuestion && state.currentQuestion.correctAnswer ? state.currentQuestion.correctAnswer : [];
      if (oldCorrectAnswer.includes(correctAnswer)) {
        return ({
          currentQuestion: {
            ...state.currentQuestion,
            correctAnswer: oldCorrectAnswer.filter(item => item !== correctAnswer),
          }
        });
      }
      return ({
        currentQuestion: {
          ...state.currentQuestion,
          correctAnswer: [...oldCorrectAnswer, correctAnswer],
        }
      });
    });
  }

  renderQuestion = () => {
    const { pointer, filter } = this.state;
    const currentQuestion = this.state.currentQuestion || {};
    return (
      <div className="wrapper-question QuestionDetail">
        <h6 className="title-left">
          {`Câu hỏi`}
        </h6>
        <div className="question d-flex">
          <div className="left">
            <CKEditor
              data={currentQuestion.question || ''}
              onChange={e => this.onEditorChange(e)}
              config={{
                height: 128,
                resize_maxHeight: 374,
                resize_minHeight: 232,
              }}
            />
          </div>
          <div className="right  d-flex flex-column">
            {[1, 2, 3, 4].map(item => (
              <div className="row-option d-flex justify-content-between align-items-center">
                <div className="text">
                  {`Lựa chọn ${item}`}
                </div>
                <input type="text"
                  className=""
                  value={currentQuestion[`option${item}`] || ''}
                  onChange={(e) => this.onChangeMax255(`option${item}`, e.target.value, `errorOption${item}`)}
                />
                <input type="checkbox"
                  // name="radio-btn-exam"
                  checked={currentQuestion.correctAnswer.includes(`option${item}`)
                    || currentQuestion.correctAnswer.includes(currentQuestion[`option${item}`])}
                  onClick={() => this.choose(`option${item}`)}
                  title="Đánh dấu đáp án đúng"
                  onChange={() => { }}
                />
              </div>
            ))}
            <div className="row-option d-flex justify-content-between align-items-center">
              <div className="text">
                Loại câu hỏi
              </div>
              <div className="question-type d-flex align-items-center justify-content-between">
                <select defaultValue={filter.grade} onChange={(e) => this.onChangeFilter('grade', e.target.value, 'errorName')}>
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Đại học">Đại học</option>
                </select>

                <select value={filter.subject} onChange={(e) => this.onChangeFilter('subject', e.target.value, 'errorName')}>
                  {subjects2.map((item, i) => {
                    if (filter.grade === 'Lớp 10') {
                      if (i < 3) {
                        return (
                          <option value={item.vn}>{item.vn}</option>
                        );
                      }
                      return null;
                    } else {
                      return (
                        <option value={item.vn}>{item.vn}</option>
                      );
                    }
                  }
                  )}
                </select>

                <select defaultValue={filter.mode} onChange={(e) => this.onChangeFilter('mode', e.target.value, 'errorName')}>
                  {MODE.map(item => ((
                    <option value={item}>{item}</option>
                  )))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { listQ, pointer } = this.state;
    const { isShow, callingApi } = this.props;
    const canSave = true;
    // if ((!role || !role.includes("ROLE_ADMIN")) && isDone) return <Redirect to='/' />
    return (
      <AdminContent>
        <div className="QuestionDetail">

          <div >
            {this.renderQuestion()}

            <div className="wrapper-btn d-flex justify-content-between align-items-center">
              <button className={`btn btn-outline-info ${canSave ? '' : 'disable'}`} onClick={() => this.save(canSave)}>
                {`Lưu`}
              </button>
            </div>
          </div>
        </div>
      </AdminContent>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { auth: { account }, exam: { callingApi } } = state;
  return {
    role: account.role,
    callingApi,
  }
}

export default withRouter(connect(
  mapStateToProps,
  {
    changeHeader,
  }
)(QuestionDetail));
