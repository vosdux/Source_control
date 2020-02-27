import React, { Component } from 'react';
import axios from 'axios';
import { getAccessToken } from '../helpers/Utils';
import { errorModalCreate } from '../helpers/Modals';
import { Button, Col, Row, Statistic, Table, Spin } from 'antd';

class StatisticModule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    title: 'Наименование',
                    dataIndex: 'title'
                },
                {
                    title: 'Количество',
                    dataIndex: 'count'
                }
            ],
            loading: true
        }
    }

    componentDidMount() {
        this.getStatistic();
    };

    getStatistic = () => {
        const { squadId, stationId } = this.props;
        let url;
        if (stationId) {
            url = `http://localhost:5000/api/statistic/station/${stationId}`
        } else if (squadId) {
            url = `http://localhost:5000/api/statistic/squad/${squadId}`
        }
        axios({
            method: 'get',
            url,
            headers: { "Authorization": `Bearer ${getAccessToken()}` }
        })
            .then((response) => {
                if (response.status === 200) {
                    const { data } = response;
                    if (data) {
                        this.setState({ data, loading: false });
                    } else {
                        console.log(response)
                    }
                }
            })
            .catch((error) => {
                this.setState({ loading: false}, () => errorModalCreate(error.message))
            });
    };

    render() {
        const { data, columns, loading } = this.state;
        console.log(data && data.stat)
        return (
            <>
                <Row gutter={16}>
                    <Col span={12}>
                        {loading ? <Spin size="large" /> : <Statistic title="Всего людей" value={data && data.peoples} />}

                    </Col>
                    <Col span={12}>
                        {loading ? <Spin size="large" /> : <Statistic title="Полностью укомплектовано" value={data && data.okPeoples} />}
                        <Button style={{ marginTop: 16 }} type="primary">
                            Перерасчет
                    </Button>
                    </Col>
                </Row>
                <Row className='mt-2'>
                    <h1>Нехватка</h1>
                    <Table
                        loading={loading}
                        columns={columns}
                        dataSource={data && data.stat}
                    />
                </Row>
            </>
        );
    };
};

export default StatisticModule;
