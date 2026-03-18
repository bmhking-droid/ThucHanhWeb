import { Card, Space, Button, Typography, Table } from 'antd';
import { useState } from 'react';

const moves = ['Kéo', 'Búa', 'Bao'] as const;
type Move = (typeof moves)[number];
type Result = 'Thắng' | 'Thua' | 'Hòa';

type Round = {
	key: number;
	player: Move;
	computer: Move;
	result: Result;
};

const computeResult = (player: Move, computer: Move): Result => {
	if (player === computer) return 'Hòa';
	if (player === 'Kéo') return computer === 'Bao' ? 'Thắng' : 'Thua';
	if (player === 'Búa') return computer === 'Kéo' ? 'Thắng' : 'Thua';
	if (player === 'Bao') return computer === 'Búa' ? 'Thắng' : 'Thua';
	return 'Hòa';
};

const OanTuTiPage = () => {
	const [history, setHistory] = useState<Round[]>([]);
	const [lastRound, setLastRound] = useState<Round | null>(null);
	const [winCount, setWinCount] = useState(0);
	const [loseCount, setLoseCount] = useState(0);
	const [drawCount, setDrawCount] = useState(0);

	const onPlay = (player: Move) => {
		const computer = moves[Math.floor(Math.random() * moves.length)];
		const result = computeResult(player, computer);
		const newRound: Round = {
			key: history.length + 1,
			player,
			computer,
			result,
		};

		setHistory((prev) => [newRound, ...prev]);
		setLastRound(newRound);

		if (result === 'Thắng') setWinCount((v) => v + 1);
		if (result === 'Thua') setLoseCount((v) => v + 1);
		if (result === 'Hòa') setDrawCount((v) => v + 1);
	};

	const columns = [
		{ title: 'Ván', dataIndex: 'key', key: 'key', width: 60 },
		{ title: 'Bạn chọn', dataIndex: 'player', key: 'player' },
		{ title: 'Máy chọn', dataIndex: 'computer', key: 'computer' },
		{ title: 'Kết quả', dataIndex: 'result', key: 'result' },
	];

	return (
		<Card style={{ minHeight: 'calc(100vh - 140px)' }}>
			<Typography.Title level={2}>Game Oẳn Tù Tì</Typography.Title>
			<Typography.Paragraph>
				Chọn Kéo, Búa hoặc Bao. Máy sẽ chọn ngẫu nhiên, hệ thống so sánh và hiển thị thắng/thua/hòa cùng lịch sử ván
				đấu.
			</Typography.Paragraph>

			<Space style={{ marginBottom: 16 }}>
				{moves.map((move) => (
					<Button key={move} type='primary' size='large' onClick={() => onPlay(move)}>
						{move}
					</Button>
				))}
			</Space>

			{lastRound && (
				<div style={{ marginBottom: 16 }}>
					<Typography.Title level={4}>Kết quả lần chơi gần nhất</Typography.Title>
					<p>
						Bạn: <strong>{lastRound.player}</strong> | Máy: <strong>{lastRound.computer}</strong> | Kết quả:{' '}
						<strong>{lastRound.result}</strong>
					</p>
					<p>
						Thắng: <strong>{winCount}</strong>, Thua: <strong>{loseCount}</strong>, Hòa: <strong>{drawCount}</strong>
					</p>
				</div>
			)}

			<Table dataSource={history} columns={columns} pagination={{ pageSize: 5 }} />
		</Card>
	);
};

export default OanTuTiPage;
