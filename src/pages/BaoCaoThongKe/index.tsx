import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Space, message, Modal, Select } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import moment from 'moment';

import type { DonDangKy } from '@/models/dondangky/dondangky';
import type { CauLacBo } from '@/models/caulacbo/caulacbo';
import { getDanhSachDon } from '@/services/dondangky/dondangkyService';
import { getDanhSachCLB } from '@/services/caulacbo/caulacboService';
import ColumnChart from '@/components/Chart/ColumnChart';

interface StatisticData {
	totalCLB: number;
	totalPending: number;
	totalApproved: number;
	totalRejected: number;
}

interface ChartDataMap {
	tenCLB: string;
	Pending: number;
	Approved: number;
	Rejected: number;
}

const BaoCaoThongKeDialog: React.FC = () => {
	const [data, setData] = useState<DonDangKy[]>([]);
	const [clubs, setClubs] = useState<CauLacBo[]>([]);
	const [loading, setLoading] = useState(false);
	const [statistics, setStatistics] = useState<StatisticData>({
		totalCLB: 0,
		totalPending: 0,
		totalApproved: 0,
		totalRejected: 0,
	});
	const [chartXAxis, setChartXAxis] = useState<string[]>([]);
	const [chartYAxis, setChartYAxis] = useState<number[][]>([]);
	const [exportModalVisible, setExportModalVisible] = useState(false);
	const [selectedClubForExport, setSelectedClubForExport] = useState<number | null>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [donRes, clbRes] = await Promise.all([getDanhSachDon(), getDanhSachCLB()]);
			setData(donRes);
			setClubs(clbRes);

			// Calculate statistics
			const stats: StatisticData = {
				totalCLB: clbRes.length,
				totalPending: donRes.filter((d) => d.trangThai === 'Pending').length,
				totalApproved: donRes.filter((d) => d.trangThai === 'Approved').length,
				totalRejected: donRes.filter((d) => d.trangThai === 'Rejected').length,
			};
			setStatistics(stats);

			// Prepare chart data
			const chartDataMap = new Map<number, ChartDataMap>();

			clbRes.forEach((club) => {
				chartDataMap.set(club.id, {
					tenCLB: club.tenCLB,
					Pending: 0,
					Approved: 0,
					Rejected: 0,
				});
			});

			donRes.forEach((don) => {
				const info = chartDataMap.get(don.idCLB);
				if (info) {
					if (don.trangThai === 'Pending') info.Pending++;
					else if (don.trangThai === 'Approved') info.Approved++;
					else if (don.trangThai === 'Rejected') info.Rejected++;
				}
			});

			const chartDataArray = Array.from(chartDataMap.values());
			const xAxis = chartDataArray.map((item) => item.tenCLB);
			const pendingData = chartDataArray.map((item) => item.Pending);
			const approvedData = chartDataArray.map((item) => item.Approved);
			const rejectedData = chartDataArray.map((item) => item.Rejected);

			setChartXAxis(xAxis);
			setChartYAxis([pendingData, approvedData, rejectedData]);
		} catch (error) {
			message.error('Lỗi khi lấy dữ liệu');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleExportModal = () => {
		setExportModalVisible(true);
	};

	const handleExportOk = async () => {
		try {
			if (!selectedClubForExport) {
				message.warning('Vui lòng chọn câu lạc bộ');
				return;
			}

			// Filter approved members of selected club
			const selectedClub = clubs.find((c) => c.id === selectedClubForExport);
			const approvedMembers = data.filter((d) => d.trangThai === 'Approved' && d.idCLB === selectedClubForExport);

			if (approvedMembers.length === 0) {
				message.warning('Không có thành viên Approved trong CLB này');
				return;
			}

			// Prepare data for export
			const exportData = approvedMembers.map((member, index) => ({
				STT: index + 1,
				'Họ tên': member.hoTen,
				Email: member.email,
				'Số điện thoại': member.sdt,
				'Giới tính': member.gioiTinh,
				'Địa chỉ': member.diaChi,
				'Số trường': member.soTruong,
				'Lý do đăng ký': member.lyDoDK,
				'Ghi chú': member.ghiChu,
			}));

			// Create workbook
			const ws = XLSX.utils.json_to_sheet(exportData);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Thành Viên');

			// Set column widths
			ws['!cols'] = [
				{ wch: 5 }, // STT
				{ wch: 20 }, // Họ tên
				{ wch: 25 }, // Email
				{ wch: 15 }, // SĐT
				{ wch: 12 }, // Giới tính
				{ wch: 20 }, // Địa chỉ
				{ wch: 15 }, // Số trường
				{ wch: 25 }, // Lý do
				{ wch: 20 }, // Ghi chú
			];

			// Download file
			const fileName = `DanhSach_${selectedClub?.tenCLB}_${moment().format('YYYY-MM-DD')}.xlsx`;
			XLSX.writeFile(wb, fileName);
			message.success(`Xuất ${approvedMembers.length} thành viên thành công`);
			setExportModalVisible(false);
			setSelectedClubForExport(null);
		} catch (error) {
			message.error('Lỗi khi xuất file');
		}
	};

	return (
		<div style={{ padding: '24px' }}>
			<Card title={<span style={{ fontSize: '20px' }}>Báo cáo và Thống kê</span>}>
				{/* Statistics Cards */}
				<Row gutter={16} style={{ marginBottom: '24px' }}>
					<Col xs={24} sm={12} lg={6}>
						<Card loading={loading}>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>{statistics.totalCLB}</div>
								<div style={{ color: '#666', marginTop: '8px' }}>Tổng số CLB</div>
							</div>
						</Card>
					</Col>

					<Col xs={24} sm={12} lg={6}>
						<Card loading={loading}>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>{statistics.totalPending}</div>
								<div style={{ color: '#666', marginTop: '8px' }}>Đang chờ duyệt</div>
							</div>
						</Card>
					</Col>

					<Col xs={24} sm={12} lg={6}>
						<Card loading={loading}>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>{statistics.totalApproved}</div>
								<div style={{ color: '#666', marginTop: '8px' }}>Đã duyệt</div>
							</div>
						</Card>
					</Col>

					<Col xs={24} sm={12} lg={6}>
						<Card loading={loading}>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f5222d' }}>{statistics.totalRejected}</div>
								<div style={{ color: '#666', marginTop: '8px' }}>Bị từ chối</div>
							</div>
						</Card>
					</Col>
				</Row>

				{/* Chart */}
				<Card title='Số đơn đăng ký theo từng CLB' style={{ marginBottom: '24px' }} loading={loading}>
					{chartXAxis.length > 0 && (
						<ColumnChart
							xAxis={chartXAxis}
							yAxis={chartYAxis}
							yLabel={['Đang chờ duyệt', 'Đã duyệt', 'Bị từ chối']}
							colors={['#faad14', '#52c41a', '#f5222d']}
							height={400}
						/>
					)}
				</Card>

				{/* Export Button */}
				<Card title='Xuất dữ liệu'>
					<Space>
						<Button type='primary' icon={<DownloadOutlined />} onClick={handleExportModal} loading={loading}>
							Xuất danh sách thành viên
						</Button>
					</Space>
				</Card>
			</Card>

			{/* Export Modal */}
			<Modal
				title='Xuất danh sách thành viên (Approved)'
				visible={exportModalVisible}
				onOk={handleExportOk}
				onCancel={() => {
					setExportModalVisible(false);
					setSelectedClubForExport(null);
				}}
				okText='Xuất'
				cancelText='Hủy'
			>
				<div>
					<p>Vui lòng chọn câu lạc bộ để xuất danh sách thành viên Approved:</p>
					<Select
						placeholder='Chọn CLB'
						value={selectedClubForExport}
						onChange={setSelectedClubForExport}
						style={{ width: '100%' }}
					>
						{clubs.map((club) => (
							<Select.Option key={club.id} value={club.id}>
								{club.tenCLB}
							</Select.Option>
						))}
					</Select>
				</div>
			</Modal>
		</div>
	);
};

export default BaoCaoThongKeDialog;
