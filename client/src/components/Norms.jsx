import React, { Component } from 'react';
import { Tabs, Layout, Table, Select, Icon, Button, Modal, Input } from 'antd';
import AddPropertToNorm from './Forms/AddPropertToNorm';
import { http } from '../helpers/Utils';
import { errorModalCreate } from '../helpers/Modals';

class Norms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            columns: [
                {
                    title: 'Наименование',
                    dataIndex: 'property.name'
                },
                {
                    title: 'Количество',
                    dataIndex: 'count'
                },
                {
                    title: '',
                    key: 'edit',
                    render: (text, record, index) => <Icon type="edit" onClick={() => this.openEditModal(index)} />
                },
                {
                    title: '',
                    key: 'delete',
                    render: (text, record, index) => <Icon type="delete" onClick={() => this.deleteItem(index)} />
                }
            ],
            activeKey: 0,
            page: 0,
            edited: false,
            editModalVisible: false,
            addModalVisible: false
        }
    }

    componentDidMount() {
        this.getNorms();
        this.getRanks();
    }

    getNorms = async () => {
        try {
            const response = await http('api/norm/');
            if (response.status === 200) {
                if (response.data) {
                    const { data } = response;
                    this.setState({ loading: false, data: data.content });
                }
            }
        } catch (error) {
            this.setState({ loading: false }, () => errorModalCreate(error.response.data.message));
        }
    };

    editNorms = async () => {
        try {
            const { activeKey, data } = this.state;
            const response = await http(`api/norm/${data[activeKey]._id}`, 'put', data);
            if (response.data) {
                const { data } = response;
                this.setState({ loading: false, data: data.content });
            }
        } catch (error) {
            this.setState({ loading: false }, () => errorModalCreate(error.response.data.message));
        }
    }

    getRanks = async () => {
        try {
            const response = await http('api/rank/');
            if (response.status === 200) {
                if (response.data) {
                    const { data } = response;
                    this.setState({ loading: false, ranks: data.content });
                }
            }
        } catch (error) {
            this.setState({ loading: false }, () => errorModalCreate(error.response.data.message))
        }
    };

    onTabChange = (key) => {
        this.setState({ activeKey: key });
    };

    deleteItem = (index) => {
        const { data, activeKey, page } = this.state;
        let editedItem = index;
        let newData = data;
        if (page > 0) {
            editedItem = (page * 10) + index
        }
        newData[activeKey].properties.splice(editedItem, 1);
        this.setState({ data: newData, edited: true });
    };

    openEditModal = (index) => {
        const { page } = this.state;
        let editedItem = index;
        if (page > 0) {
            editedItem = (page * 10) + index
        }
        this.setState({ editModalVisible: true, editedItem, edited: true });
    };

    handleSelectChange = (value) => {
        const { activeKey, data } = this.state;
        let newData = data;
        newData[activeKey].owners = [value];
        this.setState({ data: newData, edited: true });
    };

    handleInputChange = (e) => {
        const { activeKey, editedItem, data } = this.state;
        const newData = data;
        newData[activeKey].properties[editedItem].count = e.target.value;
        this.setState({ changedCount: newData });
    };

    onModalOk = () => {
        const { changedCount } = this.state;
        this.setState({ data: changedCount, edited: true })
    };

    onTableChange = (pagination) => {
        this.setState({ page: --pagination.current })
    };

    addProperty = (values) => {
        const { activeKey, data } = this.state;
        let newData = data;
        newData[activeKey].properties.push(values);
        this.setState({ data: newData });
    }

    render() {
        const { data, columns, loading, ranks, edited, editModalVisible, activeKey, editedItem, addModalVisible } = this.state;
        const { TabPane } = Tabs;
        const { Content } = Layout;
        let options;
        if (ranks) {
            options = ranks.map((item, index) => <Select.Option value={item._id} key={index}>{item.name}</Select.Option>);
        }
        return (
            <Content style={{ padding: '0 24px', minHeight: 280 }}>
                <Tabs activeKey={`${activeKey}`} tabPosition='left' onChange={this.onTabChange}>
                    {data && data.map((item, index) => <TabPane tab={item.name} key={index}>
                        <Button type='primary' onClick={() => this.setState({ addModalVisible: true })}>Добавить</Button>
                        <Table
                            rowKey={(record) => record.property._id}
                            loading={loading}
                            columns={columns}
                            dataSource={item.properties}
                            onChange={this.onTableChange}
                        />
                        <div className='d-flex'>
                            <Select
                                onChange={(value) => this.handleSelectChange(value)}
                                defaultValue={item.owners}
                            >
                                {options}
                            </Select>
                        </div>
                        <div className='d-flex mt-2'>
                            <Button type='primary' disabled={!edited} onClick={this.editNorms}>Сохранить изменения</Button>
                        </div>
                    </TabPane>
                    )}
                </Tabs>
                <Modal
                    title='Изменить количество'
                    visible={editModalVisible}
                    onOk={this.onModalOk}
                    onCancel={() => this.setState({ editModalVisible: false })}
                >
                    <Input
                        placeholder='Введите количество'
                        defaultValue={editModalVisible && data[activeKey].properties[editedItem].count}
                        onChange={(e) => this.handleInputChange(e)}
                    />
                </Modal>
                <Modal
                    title='Добавить имущество'
                    visible={addModalVisible}
                >
                    <AddPropertToNorm
                        onSubmit={this.addProperty}
                    />
                </Modal>
            </Content>
        );
    };
};

export default Norms;