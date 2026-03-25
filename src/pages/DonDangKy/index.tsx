import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Card, Space, Tooltip, Popconfirm, message, Tag, Select, Typography, Divider, List } from 'antd';
import { FormOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import moment from 'moment';

import type { DonDangKy, LichSuDuyet } from '@/models/dondangky/dondangky';
import { getDanhSachDon, themDon, suaDon, xoaDon, pheDuyetNhieuDon } from '@/services/dondangky/dondangkyService';
import { getDanhSachCLB } from '@/services/caulacbo/caulacboService';
import type { CauLacBo } from '@/models/caulacbo/caulacbo';

const { Text } = Typography;
const { Option } = Select;

const DonDangKyPage: React.FC = () => {
    const [data, setData] = useState<DonDangKy[]>([]);
    const [clubs, setClubs] = useState<CauLacBo[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DonDangKy | null>(null);
    const [form] = Form.useForm();
    
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectForm] = Form.useForm();
    const [rejectingIds, setRejectingIds] = useState<number[]>([]);

    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [currentHistory, setCurrentHistory] = useState<LichSuDuyet[]>([]);

    // Table selection
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // Search state
    const searchInput = useRef<InputRef>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [donRes, clbRes] = await Promise.all([getDanhSachDon(), getDanhSachCLB()]);
            const enrichedDon = donRes.map(d => {
                const matchedCLB = clbRes.find(c => c.id === d.idCLB);
                return { ...d, tenCLB: matchedCLB?.tenCLB || 'Unknown' };
            });
            setData(enrichedDon);
            setClubs(clbRes);
            setSelectedRowKeys([]); 
        } catch (error) {
            message.error('Lỗi khi lấy dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Selection
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    // Form logic
    const openModal = (record?: DonDangKy) => {
        setEditingRecord(record || null);
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
            form.setFieldsValue({ gioiTinh: 'Nam' });
        }
        setModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (editingRecord) {
                await suaDon(editingRecord.id, values);
                message.success('Cập nhật đơn thành công');
            } else {
                await themDon(values);
                message.success('Thêm mới đơn thành công');
            }
            setModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await xoaDon(id);
            message.success('Xóa đơn thành công');
            fetchData();
        } catch (error) {
            message.error('Lỗi khi xóa đơn');
            setLoading(false);
        }
    };

    // Approval logic
    const handleApproveBatch = () => {
        if (!selectedRowKeys.length) return;
        Modal.confirm({
            title: `Xác nhận duyệt ${selectedRowKeys.length} đơn?`,
            content: 'Các đơn đăng ký này sẽ được chuyển sang trạng thái Approved.',
            onOk: async () => {
                try {
                    setLoading(true);
                    await pheDuyetNhieuDon(selectedRowKeys as number[], 'Approved', '');
                    message.success('Đã duyệt đơn đăng ký thành công');
                    fetchData();
                } catch (e) {
                    message.error('Lỗi khi duyệt');
                    setLoading(false);
                }
            }
        });
    };

    const handleRejectBatch = () => {
        if (!selectedRowKeys.length) return;
        setRejectingIds(selectedRowKeys as number[]);
        rejectForm.resetFields();
        setRejectModalVisible(true);
    };

    const handleRejectSingle = (id: number) => {
        setRejectingIds([id]);
        rejectForm.resetFields();
        setRejectModalVisible(true);
    };

    const submitReject = async () => {
        try {
            const values = await rejectForm.validateFields();
            setLoading(true);
            await pheDuyetNhieuDon(rejectingIds, 'Rejected', values.lyDo);
            message.success('Đã từ chối đơn đăng ký');
            setRejectModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Search props
    const getColumnSearchProps = (dataIndex: keyof DonDangKy, titleName: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${titleName}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
                        Tìm
                    </Button>
                    <Button onClick={() => { clearFilters && clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value: any, record: any) =>
            record[dataIndex]
                ?.toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
    });

    const columns = [
        {
            title: 'Họ tên',
            dataIndex: 'hoTen',
            key: 'hoTen',
            sorter: (a: DonDangKy, b: DonDangKy) => a.hoTen.localeCompare(b.hoTen),
            ...getColumnSearchProps('hoTen', 'Họ tên')
        },
        {
            title: 'SĐT',
            dataIndex: 'sdt',
            key: 'sdt',
        },
        {
            title: 'Câu lạc bộ',
            dataIndex: 'tenCLB',
            key: 'tenCLB',
            sorter: (a: DonDangKy, b: DonDangKy) => (a.tenCLB || '').localeCompare(b.tenCLB || ''),
        },
        {
            title: 'Lý do ĐK',
            dataIndex: 'lyDoDK',
            key: 'lyDoDK',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Approved', value: 'Approved' },
                { text: 'Rejected', value: 'Rejected' },
            ],
            onFilter: (value: any, record: DonDangKy) => record.trangThai === value,
            render: (status: string) => {
                let color = 'gold';
                if (status === 'Approved') color = 'green';
                if (status === 'Rejected') color = 'red';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: DonDangKy) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết / Sửa">
                        <Button type="text" icon={<FormOutlined />} onClick={() => openModal(record)} />
                    </Tooltip>
                    {record.trangThai === 'Pending' && (
                        <Tooltip title="Từ chối">
                             <Button type="text" danger icon={<CloseCircleOutlined />} onClick={() => handleRejectSingle(record.id)} />
                        </Tooltip>
                    )}
                    <Tooltip title="Lịch sử duyệt">
                        <Button type="text" icon={<HistoryOutlined />} onClick={() => {
                            setCurrentHistory(record.lichSu || []);
                            setHistoryModalVisible(true);
                        }} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa đơn đăng ký"
                            description="Bạn có chắc chắn muốn xóa đơn này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={<span style={{ fontSize: '20px' }}>Quản lý Đơn đăng ký thành viên</span>}
            >
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Button type="primary" onClick={() => openModal()}>
                            Thêm mới đơn
                        </Button>
                        <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} disabled={selectedRowKeys.length === 0} onClick={handleApproveBatch}>
                            Duyệt {selectedRowKeys.length > 0 ? selectedRowKeys.length : ''} đơn
                        </Button>
                        <Button type="primary" danger disabled={selectedRowKeys.length === 0} onClick={handleRejectBatch}>
                            Từ chối {selectedRowKeys.length > 0 ? selectedRowKeys.length : ''} đơn
                        </Button>
                    </Space>
                </div>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Modal Detail / Edit */}
            <Modal
                title={editingRecord ? "Cập nhật / Xem chi tiết đơn đăng ký" : "Thêm mới đơn đăng ký"}
                visible={modalVisible}
                onOk={handleOk}
                onCancel={() => setModalVisible(false)}
                confirmLoading={loading}
                destroyOnClose
                width={700}
            >
                <Form form={form} layout="vertical">
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="sdt" label="Số điện thoại" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="gioiTinh" label="Giới tính" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select>
                                <Option value="Nam">Nam</Option>
                                <Option value="Nữ">Nữ</Option>
                                <Option value="Khác">Khác</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]} style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </div>
                    
                    <Form.Item name="diaChi" label="Địa chỉ">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="soTruong" label="Sở trường">
                        <Input />
                    </Form.Item>
                    <Form.Item name="idCLB" label="Câu lạc bộ" rules={[{ required: true, message: 'Vui lòng chọn CLB' }]}>
                        <Select placeholder="Chọn câu lạc bộ">
                            {clubs.map(c => <Option key={c.id} value={c.id}>{c.tenCLB}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="lyDoDK" label="Lý do đăng ký">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    
                    {editingRecord && editingRecord.trangThai === 'Rejected' && (
                        <Form.Item name="ghiChu" label="Lý do từ chối trước đó">
                            <Input.TextArea rows={2} disabled style={{ color: 'red' }} />
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            {/* Modal Reject */}
            <Modal
                title={`Từ chối ${rejectingIds.length} đơn đăng ký`}
                visible={rejectModalVisible}
                onOk={submitReject}
                onCancel={() => setRejectModalVisible(false)}
                confirmLoading={loading}
                destroyOnClose
            >
                <Form form={rejectForm} layout="vertical">
                    <Form.Item 
                        name="lyDo" 
                        label="Lý do từ chối" 
                        rules={[{ required: true, message: 'Bắt buộc nhập lý do từ chối!' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Nhập lý do tại sao không duyệt..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal History */}
            <Modal
                title="Lịch sử thao tác"
            
                visible={historyModalVisible}
                onCancel={() => setHistoryModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setHistoryModalVisible(false)}>Đóng</Button>
                ]}
            >
                {currentHistory && currentHistory.length > 0 ? (
                    <List
                        dataSource={currentHistory}
                        renderItem={item => (
                            <List.Item>
                                <div>
                                    <Text type="secondary">{moment(item.thoiGian).format('DD/MM/YYYY HH:mm:ss')}</Text>
                                    <div>
                                        <strong>{item.nguoiDuyet}</strong> đã <Tag color={item.hanhDong === 'Approved' ? 'green' : 'red'}>{item.hanhDong}</Tag>
                                    </div>
                                    {item.hanhDong === 'Rejected' && (
                                        <div style={{ marginTop: 4 }}>
                                            <em>Lý do: {item.lyDo}</em>
                                        </div>
                                    )}
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Chưa có lịch sử thao tác</div>
                )}
            </Modal>
        </div>
    );
};

export default DonDangKyPage;
