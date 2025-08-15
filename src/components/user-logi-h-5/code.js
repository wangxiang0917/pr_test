import { Component, Fragment } from 'react'
import { Input } from 'antd'
import './style.less'
import classnames from 'classnames'

class RoomPassword extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inputValue1: '',
      inputValue2: '',
      inputValue3: '',
      inputValue4: '',
      inputValue5: '',
      inputValue6: '',
      showPasswordError: false,
    }
  }

  componentDidMount() {
    this.setState({
      inputValue: new Array(6),
    })
    this.refs['input' + 1].focus()
  }

  valueChange(e, index) {
    let value = e.target.value

    // 修改时，对之前的值进行删除
    const oldValue = this.state['inputValue' + index]
    if (oldValue) {
      value = value.replace(oldValue, '')
    }

    // 只支持0-9和回退进行输入
    if ((value && (value >= 0 || value <= 9)) || !value) {
      // let vals = []
      // if (value.length > 1) {
      //   const split = value
      // } else {
      if (value.length > 1) {
        const split = value.split('')
        split.forEach((item, i) => {
          if (i + index <= 6) {
            this.setState(
              {
                ['inputValue' + (index + i)]: item,
              },
              () => {
                this.props.clearErrorMsg()
                this.submitHandle()
              }
            )
          }
        })
        this.refs['input' + Math.min(index + split.length, 6)].focus()
      } else {
        if (index < 6 && value) {
          this.refs['input' + (index + 1)].focus()
        }
        this.setState(
          {
            ['inputValue' + index]: value,
          },
          () => {
            this.props.clearErrorMsg()
            this.submitHandle()
          }
        )
      }

      // }
    }
  }

  handleKeydown(e, index) {
    // 回退时删除当前值并回退到上一格
    if (e.keyCode === 8) {
      if (index > 1) {
        this.refs['input' + (index - 1)].focus()
      }
      this.setState({
        ['inputValue' + index]: '',
      })
      this.props.clearErrorMsg()
      e.preventDefault()
    }
  }

  closeHandle() {
    this.props.closeHandle()
  }

  submitHandle() {
    const { inputValue1, inputValue2, inputValue3, inputValue4, inputValue5, inputValue6 } = this.state
    if (inputValue1 && inputValue2 && inputValue3 && inputValue4 && inputValue5 && inputValue6) {
      const submitValue = `${inputValue1}${inputValue2}${inputValue3}${inputValue4}${inputValue5}${inputValue6}`
      this.props.submit && this.props.submit(submitValue)
    }
  }

  resetNumber() {
    this.setState({
      inputValue1: '',
      inputValue2: '',
      inputValue3: '',
      inputValue4: '',
      inputValue5: '',
      inputValue6: '',
    })
  }

  onFocus(e, index) {
    setTimeout(() => {
      for (let i = 0; i < index - 1; i++) {
        if (!this.state['inputValue' + (i + 1)]) {
          this.refs['input' + (i + 1)].focus()
          break
        }
      }
    }, 0)
  }

  render() {
    const { inputValue1, inputValue2, inputValue3, inputValue4, inputValue5, inputValue6 } = this.state
    return (
      <Fragment>
        {
          <div className="h5-login-code">
            <div className="h5-login-code-input">
              <div className={classnames('h5-login-code-input-item', { inputed: inputValue1 })}>
                <Input
                  ref="input1"
                  type="tel"
                  pattern="[0-9]*"
                  key="1"
                  onFocus={e => this.onFocus(e, 1)}
                  onKeyDown={e => this.handleKeydown(e, 1)}
                  value={inputValue1}
                  onChange={e => this.valueChange(e, 1)}
                />
              </div>
              <div className={classnames('h5-login-code-input-item', { inputed: inputValue2 })}>
                <Input
                  ref="input2"
                  type="tel"
                  pattern="[0-9]*"
                  key="2"
                  onFocus={e => this.onFocus(e, 2)}
                  onKeyDown={e => this.handleKeydown(e, 2)}
                  value={inputValue2}
                  onChange={e => this.valueChange(e, 2)}
                />
              </div>
              <div className={classnames('h5-login-code-input-item', { inputed: inputValue3 })}>
                <Input
                  ref="input3"
                  type="tel"
                  pattern="[0-9]*"
                  key="3"
                  onFocus={e => this.onFocus(e, 3)}
                  onKeyDown={e => this.handleKeydown(e, 3)}
                  value={inputValue3}
                  onChange={e => this.valueChange(e, 3)}
                />
              </div>
              <div className={classnames('h5-login-code-input-item', { inputed: inputValue4 })}>
                <Input
                  ref="input4"
                  type="tel"
                  pattern="[0-9]*"
                  key="4"
                  onFocus={e => this.onFocus(e, 4)}
                  onKeyDown={e => this.handleKeydown(e, 4)}
                  value={inputValue4}
                  onChange={e => this.valueChange(e, 4)}
                />
              </div>
              <div className={classnames('h5-login-code-input-item', { inputed: inputValue5 })}>
                <Input
                  ref="input5"
                  type="tel"
                  pattern="[0-9]*"
                  key="5"
                  onFocus={e => this.onFocus(e, 5)}
                  onKeyDown={e => this.handleKeydown(e, 5)}
                  value={inputValue5}
                  onChange={e => this.valueChange(e, 5)}
                />
              </div>
              <div className={classnames('h5-login-code-input-item', { inputed: inputValue6 })}>
                <Input
                  ref="input6"
                  type="tel"
                  pattern="[0-9]*"
                  key="6"
                  onFocus={e => this.onFocus(e, 6)}
                  onKeyDown={e => this.handleKeydown(e, 6)}
                  value={inputValue6}
                  onChange={e => this.valueChange(e, 6)}
                />
              </div>
            </div>
          </div>
        }
      </Fragment>
    )
  }
}

export default RoomPassword
