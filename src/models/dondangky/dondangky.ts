export interface LichSuDuyet {
	thoiGian: string; 
	nguoiDuyet: string;
	hanhDong: 'Approved' | 'Rejected';
	lyDo: string; 
}

export interface DonDangKy {
	id: number;
	hoTen: string;
	email: string;
	sdt: string;
	gioiTinh: 'Nam' | 'Nữ' | 'Khác';
	diaChi: string;
	soTruong: string;
	idCLB: number;
	tenCLB?: string; 
	lyDoDK: string;
	trangThai: 'Pending' | 'Approved' | 'Rejected';
	ghiChu: string; 
	lichSu: LichSuDuyet[];
}
