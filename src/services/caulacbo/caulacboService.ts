import type { CauLacBo } from '@/models/caulacbo/caulacbo';

// Mock data 
let mockClubs: CauLacBo[] = [
    {
        id: 1,
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
        tenCLB: 'CLB Lập trình PTIT',
        ngayThanhLap: '2020-01-01',
        moTa: '<p>Câu lạc bộ chuyên về lập trình, thuật toán và phát triển phần mềm.</p>',
        chuNhiem: 'Nguyễn Văn A',
        hoatDong: true,
    },
    {
        id: 2,
        avatar: 'https://files.catbox.moe/1d2r2u.png',
        tenCLB: 'CLB Tiếng Anh PTIT',
        ngayThanhLap: '2019-05-15',
        moTa: '<p>Nơi trao đổi và cải thiện khả năng giao tiếp tiếng Anh.</p>',
        chuNhiem: 'Trần Thị B',
        hoatDong: true,
    },
];

export const getDanhSachCLB = async (): Promise<CauLacBo[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...mockClubs]);
        }, 500);
    });
};

export const themCLB = async (data: Omit<CauLacBo, 'id'>): Promise<CauLacBo> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newClub: CauLacBo = {
                ...data,
                id: Date.now(),
            };
            mockClubs.push(newClub);
            resolve(newClub);
        }, 500);
    });
};

export const suaCLB = async (id: number, data: Partial<CauLacBo>): Promise<CauLacBo> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockClubs.findIndex(c => c.id === id);
            if (index !== -1) {
                mockClubs[index] = { ...mockClubs[index], ...data };
                resolve(mockClubs[index]);
            } else {
                reject(new Error('Club not found'));
            }
        }, 500);
    });
};

export const xoaCLB = async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            mockClubs = mockClubs.filter(c => c.id !== id);
            resolve(true);
        }, 500);
    });
};
