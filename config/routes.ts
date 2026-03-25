export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	// bài tập trên lớp
	{
		path: '/todo-list',
		name: 'TodoList',
		component: './todoList',
		icon: 'UnorderedListOutlined',
	},
	{
		path: '/game-snn',
		name: 'GameSNN',
		component: './gameSNN',
		icon: 'SmileOutlined',
	},
	// QUẢN LÝ NHÂN VIÊN, DỊCH VỤ, LỊCH HẸN - TH3
	{
		name: 'Quản Lý -TH3',
		path: '/quan-ly',
		icon: 'TeamOutlined',
		routes: [
			{
				name: 'NhanVien',
				path: 'nhan-vien',
				component: './nhanvien',
				icon: 'UserOutlined',
			},
			{
				name: 'DichVu',
				path: 'dich-vu',
				component: './dichvu',
				icon: 'AppstoreOutlined',
			},
			{
				name: 'LichHen',
				path: 'lich-hen',
				component: './lichhen',
				icon: 'CalendarOutlined',
			},
			{
				name: 'DanhGia',
				path: 'danh-gia',
				component: './DanhGia',
				icon: 'StarOutlined',
			},
			{
				name: 'ThongKe',
				path: 'thong-ke',
				component: './ThongKe',
				icon: 'BarChartOutlined',
			},
		],
	},
	// QUẢN LÝ SỔ VĂN BẰNG TỐT NGHIỆP - TH4
	{
		name: 'Quản lý văn bằng',
		path: '/quan-ly-van-bang',
		icon: 'BookOutlined',
		routes: [
			{
				name: 'Sổ văn bằng',
				path: 'so-van-bang',
				component: './QuanLySoVanBang',
				icon: 'ProfileOutlined',
			},
			{
				name: 'Quyết định tốt nghiệp',
				path: 'quyet-dinh-tot-nghiep',
				component: './quyetdinhtotnghiep',
				icon: 'FileTextOutlined',
			},
		],
	},
	
	// QUẢN LÝ CÂU LẠC BỘ -TH5
	{
		name: 'Quản lý Câu Lạc Bộ',
		path: '/quan-ly-clb',
		icon: 'TeamOutlined',
		routes: [
			{
				name: 'Danh sách CLB',
				path: 'danh-sach',
				component: './CauLacBo',
				icon: 'AppstoreOutlined',
			},
			{
				name: 'Đơn đăng ký',
				path: 'don-dang-ky',
				component: './DonDangKy',
				icon: 'FormOutlined',
			},
			
		],
	},

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
