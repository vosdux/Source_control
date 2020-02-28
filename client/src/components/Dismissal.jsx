import React, { Component } from 'react'
import { Modal, Button, Typography, Row, Input, message } from 'antd';

const { confirm } = Modal;
const { Text } = Typography;

class Dismissal extends Component {
    state = {
        inputValue: '',
        modalVisible: false
    };

    handleInputChange = (e) => {
        this.setState({inputValue: e.target.value})
    }

    showModal = () => {
        this.setState({ modalVisible: true });
    };

    closeModal = () => {
        this.setState({ modalVisible: false });
    }

    checkId = () => {
        const { idcard } = this.props;
        const { inputValue } = this.state;
        console.log(idcard)
        if (inputValue === idcard) {
            this.props.archivedPeople();
        } else {
            message.error('Неверный номер удостоверения');
        }
    };

    render() {
        const { modalVisible, inputValue } = this.state;
        return (
            <div>
                <Row>
                    <Text>Отправить карточку сотрудника в архив</Text>
                </Row>
                <Row className='mt-2'>
                    <Button type='danger' onClick={this.showModal}>Уволить</Button>
                </Row>
                <Modal
                    visible={modalVisible}
                    footer={null}
                >
                    <Text>Вы дейстительно хотите отправить карточку сотрудника в архив?</Text>
                    <Text>Для подтверждения введите номер удостоверения сотрудника</Text>
                    <Input 
                        className='mt-2'
                        placeholder='№ удостоверения'
                        onChange={(e) => this.handleInputChange(e)}
                        value={inputValue}
                    />
                    <Row type='flex' className='mt-2' justify='start'>
                        <Button className='mr-10px' onClick={this.closeModal}>Отменить</Button>
                        <Button type='danger' onClick={this.checkId}>Подтвердить</Button>
                    </Row>
                </Modal>
            </div>
        )
    }
}

export default Dismissal