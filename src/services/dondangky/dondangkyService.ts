import type { DonDangKy } from '@/models/dondangky/dondangky';
import moment from 'moment';

// Mock data 
let mockApplications: DonDangKy[] = [
    {
        id: 1,
        hoTen: 'Nguyễn Văn Ứng Viên',
        email: 'ungvien@example.com',
        sdt: '0123456789',
        gioiTinh: 'Nam',
        diaChi: 'Hà Nội',
        soTruong: 'Code Dạo',
        idCLB: 1,
        tenCLB: 'CLB Lập trình PTIT',
        lyDoDK: 'Muốn học hỏi thêm',
        trangThai: 'Pending',
        ghiChu: '',
        lichSu: [],
    },
    {
        id: 2,
        hoTen: 'Trần Thị Giỏi',
        email: 'gioi.tt@example.com',
        sdt: '0987654321',
        gioiTinh: 'Nữ',
        diaChi: 'TP.HCM',
        soTruong: 'Nói tiếng Anh',
        idCLB: 2,
        tenCLB: 'CLB Tiếng Anh PTIT',
        lyDoDK: 'Muốn luyện speaking',
        trangThai: 'Approved',
        ghiChu: '',
        lichSu: [
            {
                thoiGian: new Date().toISOString(),
                nguoiDuyet: 'Admin',
                hanhDong: 'Approved',
                lyDo: 'Đủ điều kiện',
            }
        ],
    },
];

export const getDanhSachDon = async (): Promise<DonDangKy[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...mockApplications]), 500));
};

export const themDon = async (data: Omit<DonDangKy, 'id' | 'trangThai' | 'ghiChu' | 'lichSu'>): Promise<DonDangKy> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newDon: DonDangKy = {
                ...data,
                id: Date.now(),
                trangThai: 'Pending',
                ghiChu: '',
                lichSu: [],
            };
            mockApplications.push(newDon);
            resolve(newDon);
        }, 500);
    });
};

export const suaDon = async (id: number, data: Partial<DonDangKy>): Promise<DonDangKy> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockApplications.findIndex(d => d.id === id);
            if (index !== -1) {
                mockApplications[index] = { ...mockApplications[index], ...data };
                resolve(mockApplications[index]);
            } else {
                reject(new Error('Application not found'));
            }
        }, 500);
    });
};

export const xoaDon = async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            mockApplications = mockApplications.filter(d => d.id !== id);
            resolve(true);
        }, 500);
    });
};

export const pheDuyetNhieuDon = async (ids: number[], hanhDong: 'Approved' | 'Rejected', lyDo: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            mockApplications = mockApplications.map(app => {
                if (ids.includes(app.id)) {
                    return {
                        ...app,
                        trangThai: hanhDong,
                        ghiChu: hanhDong === 'Rejected' ? lyDo : app.ghiChu,
                        lichSu: [
                            ...app.lichSu,
                            {
                                thoiGian: new Date().toISOString(),
                                nguoiDuyet: 'Admin',
                                hanhDong,
                                lyDo: hanhDong === 'Rejected' ? lyDo : 'Đã duyệt hàng loạt',
                            }
                        ]
                    };
                }
                return app;
            });
            resolve(true);
        }, 500);
    });
};
