import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Card, Space, Tooltip, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { history } from 'umi';

import type { CauLacBo } from '@/models/caulacbo/caulacbo';
import { getDanhSachCLB, themCLB, suaCLB, xoaCLB } from '@/services/caulacbo/caulacboService';
import UploadFile from '@/components/Upload/UploadFile';
import TinyEditor from '@/components/TinyEditor';

const CauLacBoPage: React.FC = () => {
	const [data, setData] = useState<CauLacBo[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingRecord, setEditingRecord] = useState<CauLacBo | null>(null);
	const [form] = Form.useForm();
	const searchInput = useRef<InputRef>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await getDanhSachCLB();
			setData(res);
		} catch (error) {
			message.error('Lỗi khi lấy danh sách câu lạc bộ');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: keyof CauLacBo) => {
		confirm();
	};

	const handleReset = (clearFilters: () => void) => {
		clearFilters();
	};

	const getColumnSearchProps = (dataIndex: keyof CauLacBo, titleName: string) => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
			<div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
				<Input
					ref={searchInput}
					placeholder={`Tìm kiếm ${titleName}`}
					value={selectedKeys[0]}
					onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<Space>
					<Button
						type='primary'
						onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
						icon={<SearchOutlined />}
						size='small'
						style={{ width: 90 }}
					>
						Tìm
					</Button>
					<Button onClick={() => clearFilters && handleReset(clearFilters)} size='small' style={{ width: 90 }}>
						Reset
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
		onFilter: (value: any, record: any) =>
			record[dataIndex]
				?.toString()
				.toLowerCase()
				.includes((value as string).toLowerCase()),
		onFilterDropdownOpenChange: (visible: boolean) => {
			if (visible) {
				setTimeout(() => searchInput.current?.select(), 100);
			}
		},
	});

	const openModal = (record?: CauLacBo) => {
		setEditingRecord(record || null);
		if (record) {
			form.setFieldsValue({
				...record,
				avatar: record.avatar ? [record.avatar] : [],
			});
		} else {
			form.resetFields();
			form.setFieldsValue({ hoatDong: true });
		}
		setModalVisible(true);
	};

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			let avatarUrl = '';
			if (values.avatar && values.avatar.fileList && values.avatar.fileList.length > 0) {
				const file = values.avatar.fileList[0];
				avatarUrl = file.url || file.response?.url || file.preview || '';
			} else if (Array.isArray(values.avatar) && typeof values.avatar[0] === 'string') {
				avatarUrl = values.avatar[0];
			} else if (values.avatar && values.avatar.length > 0 && values.avatar[0].url) {
				avatarUrl = values.avatar[0].url;
			} else if (values.avatar && values.avatar.fileList && values.avatar.fileList.length === 0) {
				avatarUrl = '';
			} else if (editingRecord?.avatar) {
				avatarUrl = editingRecord.avatar;
			}

			const submitData = {
				...values,
				avatar: avatarUrl,
			};

			if (editingRecord) {
				await suaCLB(editingRecord.id, submitData);
				message.success('Cập nhật câu lạc bộ thành công');
			} else {
				await themCLB(submitData);
				message.success('Thêm mới câu lạc bộ thành công');
			}
			setModalVisible(false);
			fetchData();
		} catch (error) {
			console.error('Validation Failed:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			setLoading(true);
			await xoaCLB(id);
			message.success('Xóa câu lạc bộ thành công');
			fetchData();
		} catch (error) {
			message.error('Lỗi khi xóa câu lạc bộ');
			setLoading(false);
		}
	};

	const columns = [
		{
			title: 'Ảnh',
			dataIndex: 'avatar',
			key: 'avatar',
			width: 80,
			render: (avatar: string) =>
				avatar ? (
					<img src={avatar} alt='avatar' style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
				) : (
					'-'
				),
		},
		{
			title: 'Tên câu lạc bộ',
			dataIndex: 'tenCLB',
			key: 'tenCLB',
			sorter: (a: CauLacBo, b: CauLacBo) => a.tenCLB.localeCompare(b.tenCLB),
			...getColumnSearchProps('tenCLB', 'Tên CLB'),
		},
		{
			title: 'Chủ nhiệm',
			dataIndex: 'chuNhiem',
			key: 'chuNhiem',
			sorter: (a: CauLacBo, b: CauLacBo) => a.chuNhiem.localeCompare(b.chuNhiem),
			...getColumnSearchProps('chuNhiem', 'Chủ nhiệm'),
		},
		{
			title: 'Ngày thành lập',
			dataIndex: 'ngayThanhLap',
			key: 'ngayThanhLap',
			sorter: (a: CauLacBo, b: CauLacBo) => new Date(a.ngayThanhLap).getTime() - new Date(b.ngayThanhLap).getTime(),
		},
		{
			title: 'Hoạt động',
			dataIndex: 'hoatDong',
			key: 'hoatDong',
			render: (hoatDong: boolean) => <Switch checked={hoatDong} disabled />,
		},
		{
			title: 'Thao tác',
			key: 'action',
			render: (_: any, record: CauLacBo) => (
				<Space size='middle'>
					<Tooltip title='Xem thành viên'>
						<Button
							type='text'
							icon={<UsergroupAddOutlined />}
							onClick={() => history.push(`/quan-ly-clb/thanh-vien?idCLB=${record.id}`)}
						/>
					</Tooltip>
					<Tooltip title='Chỉnh sửa'>
						<Button type='text' icon={<EditOutlined />} onClick={() => openModal(record)} />
					</Tooltip>
					<Tooltip title='Xóa'>
						<Popconfirm title='Xóa câu lạc bộ' okText='Có' cancelText='Không' onConfirm={() => handleDelete(record.id)}>
							<Button type='text' danger icon={<DeleteOutlined />} />
						</Popconfirm>
					</Tooltip>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: '24px' }}>
			<Card
				title={<span style={{ fontSize: '20px' }}>Quản lý Câu lạc bộ</span>}
				extra={
					<Button type='primary' icon={<PlusOutlined />} onClick={() => openModal()}>
						Thêm mới
					</Button>
				}
			>
				<Table columns={columns} dataSource={data} rowKey='id' loading={loading} pagination={{ pageSize: 10 }} />
			</Card>

			<Modal
				title={editingRecord ? 'Cập nhật câu lạc bộ' : 'Thêm mới câu lạc bộ'}
				visible={modalVisible}
				onOk={handleOk}
				onCancel={() => setModalVisible(false)}
				confirmLoading={loading}
				destroyOnClose
				width={800}
			>
				<Form form={form} layout='vertical'>
					<Form.Item name='avatar' label='Ảnh đại diện'>
						<UploadFile isAvatar maxCount={1} />
					</Form.Item>

					<Form.Item
						name='tenCLB'
						label='Tên Câu lạc bộ'
						rules={[{ required: true, message: 'Vui lòng nhập tên CLB!' }]}
					>
						<Input placeholder='Nhập tên CLB...' />
					</Form.Item>

					<Form.Item
						name='chuNhiem'
						label='Chủ nhiệm'
						rules={[{ required: true, message: 'Vui lòng nhập tên chủ nhiệm!' }]}
					>
						<Input placeholder='Nhập tên chủ nhiệm...' />
					</Form.Item>

					<Form.Item
						name='ngayThanhLap'
						label='Ngày thành lập'
						rules={[{ required: true, message: 'Vui lòng chọn ngày thành lập!' }]}
					>
						<Input type='date' />
					</Form.Item>

					<Form.Item name='moTa' label='Mô tả' valuePropName='value'>
						<TinyEditor />
					</Form.Item>

					<Form.Item name='hoatDong' label='Hoạt động' valuePropName='checked'>
						<Switch />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default CauLacBoPage;
