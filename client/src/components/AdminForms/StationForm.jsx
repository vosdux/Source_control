import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';
import { errorModalCreate } from '../../helpers/Modals';
import { getAccessToken, refreshToken } from '../../helpers/Utils';
import axios from 'axios';

class AdminForm extends Component {

    saveData = async (values) => {
        try {
            const { mode, editbleData, squadId, getItems } = this.props;
            await refreshToken();
            const response = await axios({
                method: mode === 'create' ? 'post' : 'put',
                url: `http://localhost:5000/api/squad/${squadId}/${mode === 'create' ? '' : editbleData._id}`,
                headers: { "Authorization": `Bearer ${getAccessToken()}` },
                data: {
                    ...values,
                    squad: squadId
                }
            });
            if (response.status === 200) {
                getItems();
            }
        } catch (error) {
            errorModalCreate(error);
        }
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.saveData(values);
                this.props.closeModal(values);
            }
        });
    };

    render() {
        const { mode, editbleData } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="squad-form">
                <h1>Создание ПЧ</h1>
                <Form.Item>
                    {getFieldDecorator('name', {
                        rules: [{ required: true, message: 'Поле обязательно для заполнения' }],
                        initialValue: mode === 'edit' ? editbleData.name : ''
                    })(
                        <Input
                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Название ПЧ"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('place', {
                        rules: [{ required: true, message: 'Поле обязательно для заполнения' }],
                        initialValue: mode === 'edit' ? editbleData.place : ''
                    })(
                        <Input
                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Город"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        {mode === 'create' ? 'Создать' : 'Обновить'}
                    </Button>
                </Form.Item>
            </Form>
        );
    };
};

const StationForm = Form.create({ name: 'squad_form' })(AdminForm);

export default StationForm;
