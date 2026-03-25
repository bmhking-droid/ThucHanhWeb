import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Card, Space, Select, Tag, message, Tooltip } from 'antd';
import { DeleteOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { useLocation } from 'umi';
import qs from 'qs';

import type { DonDangKy } from '@/models/dondangky/dondangky';
import type { CauLacBo } from '@/models/caulacbo/caulacbo';
import { getDanhSachDon, xoaDon, doiCLBNhieuThanhVien } from '@/services/dondangky/dondangkyService';
import { getDanhSachCLB } from '@/services/caulacbo/caulacboService';

const ThanhVienCauLacBoPage: React.FC = () => {
	const location = useLocation();
	const query = qs.parse(location.search.substring(1));
	const idCLB = query.idCLB ? Number(query.idCLB) : null;

	const [data, setData] = useState<DonDangKy[]>([]);
	const [clubs, setClubs] = useState<CauLacBo[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedClub, setSelectedClub] = useState<number | null>(idCLB);

	// Modal states
	const [changeClubModalVisible, setChangeClubModalVisible] = useState(false);
	const [newClbId, setNewClbId] = useState<number | null>(null);

	// Table selection
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	// Search state
	const searchInput = useRef<InputRef>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [donRes, clbRes] = await Promise.all([getDanhSachDon(), getDanhSachCLB()]);
			setClubs(clbRes);

			// Filter by club and approved status only
			const filtered = donRes.filter(
				(d) => d.trangThai === 'Approved' && (selectedClub ? d.idCLB === selectedClub : true),
			);
			setData(filtered);
			setSelectedRowKeys([]);
		} catch (error) {
			message.error('Lỗi khi lấy dữ liệu');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [selectedClub]);

	// Selection
	const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedRowKeys);
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
	};

	const handleDelete = async (id: number) => {
		try {
			setLoading(true);
			await xoaDon(id);
			message.success('Xóa thành viên thành công');
			fetchData();
		} catch (error) {
			message.error('Lỗi khi xóa thành viên');
			setLoading(false);
		}
	};

	const handleChangeClubModal = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('Vui lòng chọn ít nhất 1 thành viên');
			return;
		}
		setChangeClubModalVisible(true);
	};

	const handleChangeClubOk = async () => {
		try {
			if (!newClbId) {
				message.warning('Vui lòng chọn câu lạc bộ');
				return;
			}
			setLoading(true);
			await doiCLBNhieuThanhVien(selectedRowKeys as number[], newClbId);
			message.success(`Đã chuyển ${selectedRowKeys.length} thành viên thành công`);
			setChangeClubModalVisible(false);
			setNewClbId(null);
			fetchData();
		} catch (error) {
			message.error('Lỗi khi đổi câu lạc bộ');
			setLoading(false);
		}
	};

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
					<Button type='primary' onClick={() => confirm()} icon={<SearchOutlined />} size='small' style={{ width: 90 }}>
						Tìm
					</Button>
					<Button onClick={() => clearFilters && clearFilters()} size='small' style={{ width: 90 }}>
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
	});

	const columns = [
		{
			title: 'Họ tên',
			dataIndex: 'hoTen',
			key: 'hoTen',
			width: 150,
			sorter: (a: DonDangKy, b: DonDangKy) => a.hoTen.localeCompare(b.hoTen),
			...getColumnSearchProps('hoTen', 'Họ tên'),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: 180,
			...getColumnSearchProps('email', 'Email'),
		},
		{
			title: 'Số điện thoại',
			dataIndex: 'sdt',
			key: 'sdt',
			width: 120,
			...getColumnSearchProps('sdt', 'SĐT'),
		},
		{
			title: 'Giới tính',
			dataIndex: 'gioiTinh',
			key: 'gioiTinh',
			width: 100,
			filters: [
				{ text: 'Nam', value: 'Nam' },
				{ text: 'Nữ', value: 'Nữ' },
				{ text: 'Khác', value: 'Khác' },
			],
			onFilter: (value: any, record: DonDangKy) => record.gioiTinh === value,
			render: (gioiTinh: string) => {
				const color = gioiTinh === 'Nam' ? 'blue' : gioiTinh === 'Nữ' ? 'magenta' : 'default';
				return <Tag color={color}>{gioiTinh}</Tag>;
			},
		},
		{
			title: 'Địa chỉ',
			dataIndex: 'diaChi',
			key: 'diaChi',
			width: 150,
		},
		{
			title: 'Số trường',
			dataIndex: 'soTruong',
			key: 'soTruong',
			width: 120,
		},
		{
			title: 'Lý do đăng ký',
			dataIndex: 'lyDoDK',
			key: 'lyDoDK',
			width: 180,
			ellipsis: true,
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 80,
			fixed: 'right' as const,
			render: (_: any, record: DonDangKy) => (
				<Space size='small'>
					<Tooltip title='Xóa'>
						<Button
							type='text'
							danger
							icon={<DeleteOutlined />}
							onClick={() =>
								Modal.confirm({
									title: 'Xóa thành viên',
									content: `Bạn có chắc chắn muốn xóa ${record.hoTen}?`,
									onOk: () => handleDelete(record.id),
								})
							}
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	const currentClubName = clubs.find((c) => c.id === selectedClub)?.tenCLB || 'Chọn CLB';

	return (
		<Card>
			<div style={{ marginBottom: 16 }}>
				<Space>
					<span>Chọn câu lạc bộ:</span>
					<Select
						placeholder='Chọn CLB'
						value={selectedClub}
						onChange={setSelectedClub}
						style={{ width: 250 }}
						loading={loading}
						allowClear
					>
						{clubs.map((club) => (
							<Select.Option key={club.id} value={club.id}>
								{club.tenCLB}
							</Select.Option>
						))}
					</Select>
				</Space>
			</div>

			{selectedClub && (
				<div style={{ marginBottom: 16 }}>
					<h3>Danh sách thành viên - {currentClubName}</h3>
					<Space>
						<span>Đã chọn: {selectedRowKeys.length}</span>
						<Button
							type='primary'
							icon={<SwapOutlined />}
							onClick={handleChangeClubModal}
							disabled={selectedRowKeys.length === 0}
						>
							Đổi CLB
						</Button>
					</Space>
				</div>
			)}

			<Table
				rowSelection={selectedClub ? rowSelection : undefined}
				columns={columns}
				dataSource={data}
				loading={loading}
				rowKey='id'
				pagination={{ pageSize: 10, total: data.length }}
			/>

			{/* Change Club Modal */}
			<Modal
				title='Đổi câu lạc bộ'
				visible={changeClubModalVisible}
				onOk={handleChangeClubOk}
				onCancel={() => {
					setChangeClubModalVisible(false);
					setNewClbId(null);
				}}
				confirmLoading={loading}
			>
				<Form layout='vertical'>
					<Form.Item label={`Số thành viên sẽ được chuyển: ${selectedRowKeys.length}`}>
						<span style={{ fontWeight: 'bold', color: '#1890ff' }}>{selectedRowKeys.length} thành viên</span>
					</Form.Item>
					<Form.Item label='Chọn câu lạc bộ đích' required>
						<Select placeholder='Chọn CLB muốn chuyển đến' value={newClbId} onChange={setNewClbId}>
							{clubs
								.filter((c) => c.id !== selectedClub)
								.map((club) => (
									<Select.Option key={club.id} value={club.id}>
										{club.tenCLB}
									</Select.Option>
								))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default ThanhVienCauLacBoPage;
