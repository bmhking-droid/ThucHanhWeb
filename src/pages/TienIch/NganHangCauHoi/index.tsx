import { useMemo, useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Table, Space, Typography, message } from 'antd';

const { Option } = Select;

type KnowledgeArea = { id: number; name: string };
type Subject = { id: number; code: string; name: string; credits: number };
type Difficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';
type Question = {
	id: number;
	subjectId: number;
	areaId: number;
	difficulty: Difficulty;
	text: string;
};
type Exam = {
	id: number;
	name: string;
	subjectId: number;
	structure: {
		easy: number;
		medium: number;
		hard: number;
		veryHard: number;
	};
	questions: Question[];
};

const difficulties: Difficulty[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

const NganHangCauHoiPage = () => {
	const [areas, setAreas] = useState<KnowledgeArea[]>([
		{ id: 1, name: 'Tổng quan' },
		{ id: 2, name: 'Chuyên sâu' },
	]);
	const [subjects, setSubjects] = useState<Subject[]>([
		{ id: 1, code: 'CN001', name: 'Cơ sở dữ liệu', credits: 3 },
		{ id: 2, code: 'CN002', name: 'Lập trình web', credits: 3 },
	]);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [exams, setExams] = useState<Exam[]>([]);

	const [filterSubject, setFilterSubject] = useState<number | undefined>();
	const [filterArea, setFilterArea] = useState<number | undefined>();
	const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | undefined>();

	const filteredQuestions = useMemo(() => {
		return questions.filter((q) => {
			if (filterSubject && q.subjectId !== filterSubject) return false;
			if (filterArea && q.areaId !== filterArea) return false;
			if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
			return true;
		});
	}, [questions, filterSubject, filterArea, filterDifficulty]);

	const addArea = (values: { name: string }) => {
		if (!values.name) return;
		const exist = areas.some((a) => a.name.trim().toLowerCase() === values.name.trim().toLowerCase());
		if (exist) {
			message.warning('Phân loại kiến thức đã tồn tại');
			return;
		}
		setAreas((prev) => [...prev, { id: Date.now(), name: values.name.trim() }]);
		message.success('Thêm khối kiến thức thành công');
	};

	const addSubject = (values: { code: string; name: string; credits: number }) => {
		if (!values.code || !values.name || !values.credits) return;
		const exist = subjects.some((s) => s.code.trim().toLowerCase() === values.code.trim().toLowerCase());
		if (exist) {
			message.warning('Mã môn học đã tồn tại');
			return;
		}
		setSubjects((prev) => [
			...prev,
			{ id: Date.now(), code: values.code.trim(), name: values.name.trim(), credits: values.credits },
		]);
		message.success('Thêm môn học thành công');
	};

	const addQuestion = (values: { subjectId: number; areaId: number; difficulty: Difficulty; text: string }) => {
		if (!values.text) return;
		setQuestions((prev) => [
			...prev,
			{
				id: Date.now(),
				subjectId: values.subjectId,
				areaId: values.areaId,
				difficulty: values.difficulty,
				text: values.text.trim(),
			},
		]);
		message.success('Thêm câu hỏi thành công');
	};

	const createExam = (values: {
		name: string;
		subjectId: number;
		easy: number;
		medium: number;
		hard: number;
		veryHard: number;
	}) => {
		const subject = subjects.find((s) => s.id === values.subjectId);
		if (!subject) {
			message.error('Chọn môn học để tạo đề');
			return;
		}

		const pool = questions.filter((q) => q.subjectId === values.subjectId);
		const pick = (difficulty: Difficulty, count: number): Question[] => {
			const candidates = pool.filter((item) => item.difficulty === difficulty);
			if (candidates.length < count) return [];
			const selected: Question[] = [];
			const clone = [...candidates];
			for (let i = 0; i < count; i += 1) {
				const idx = Math.floor(Math.random() * clone.length);
				selected.push(clone.splice(idx, 1)[0]);
			}
			return selected;
		};

		const selectedQuestions = [
			...pick('Dễ', values.easy),
			...pick('Trung bình', values.medium),
			...pick('Khó', values.hard),
			...pick('Rất khó', values.veryHard),
		];

		const requiredTotal = values.easy + values.medium + values.hard + values.veryHard;
		if (selectedQuestions.length !== requiredTotal) {
			message.error('Không đủ câu hỏi trong ngân hàng để tạo đề theo yêu cầu. Vui lòng thêm nhiều câu hỏi hơn.');
			return;
		}

		const exam: Exam = {
			id: Date.now(),
			name: values.name.trim(),
			subjectId: values.subjectId,
			structure: {
				easy: values.easy,
				medium: values.medium,
				hard: values.hard,
				veryHard: values.veryHard,
			},
			questions: selectedQuestions,
		};

		setExams((prev) => [exam, ...prev]);
		message.success('Tạo đề thi thành công');
	};

	return (
		<div style={{ display: 'grid', gap: 16 }}>
			<Card title='1. Danh mục khối kiến thức' style={{ minHeight: 200 }}>
				<Form layout='inline' onFinish={addArea}>
					<Form.Item name='name' rules={[{ required: true, message: 'Nhập tên khối kiến thức' }]}>
						<Input placeholder='Tên khối kiến thức, ví dụ: Tổng quan' />
					</Form.Item>
					<Form.Item>
						<Button type='primary' htmlType='submit'>
							Thêm
						</Button>
					</Form.Item>
				</Form>

				<Table
					style={{ marginTop: 16 }}
					dataSource={areas.map((item) => ({ ...item, key: item.id }))}
					columns={[
						{ title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
						{ title: 'Tên khối kiến thức', dataIndex: 'name', key: 'name' },
					]}
					pagination={false}
				/>
			</Card>

			<Card title='2. Danh mục môn học' style={{ minHeight: 240 }}>
				<Form layout='inline' onFinish={addSubject}>
					<Form.Item name='code' rules={[{ required: true, message: 'Nhập mã môn học' }]}>
						<Input placeholder='Mã môn học' />
					</Form.Item>
					<Form.Item name='name' rules={[{ required: true, message: 'Nhập tên môn học' }]}>
						<Input placeholder='Tên môn học' />
					</Form.Item>
					<Form.Item name='credits' rules={[{ required: true, message: 'Nhập số tín chỉ' }]}>
						<InputNumber min={1} max={30} placeholder='Tín chỉ' />
					</Form.Item>
					<Form.Item>
						<Button type='primary' htmlType='submit'>
							Thêm
						</Button>
					</Form.Item>
				</Form>

				<Table
					style={{ marginTop: 16 }}
					dataSource={subjects.map((item) => ({ ...item, key: item.id }))}
					columns={[
						{ title: 'Mã môn', dataIndex: 'code', key: 'code' },
						{ title: 'Tên môn', dataIndex: 'name', key: 'name' },
						{ title: 'Tín chỉ', dataIndex: 'credits', key: 'credits', width: 110 },
					]}
					pagination={false}
				/>
			</Card>

			<Card title='3. Quản lý câu hỏi' style={{ minHeight: 320 }}>
				<Form layout='vertical' onFinish={addQuestion}>
					<Space align='start' wrap>
						<Form.Item name='subjectId' label='Môn học' rules={[{ required: true }]}>
							<Select style={{ width: 200 }} placeholder='Chọn môn học'>
								{subjects.map((subject) => (
									<Option key={subject.id} value={subject.id}>{`${subject.code} - ${subject.name}`}</Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item name='areaId' label='Khối kiến thức' rules={[{ required: true }]}>
							<Select style={{ width: 200 }} placeholder='Chọn khối kiến thức'>
								{areas.map((a) => (
									<Option key={a.id} value={a.id}>
										{a.name}
									</Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item name='difficulty' label='Mức độ' rules={[{ required: true }]}>
							<Select style={{ width: 160 }} placeholder='Chọn mức độ'>
								{difficulties.map((d) => (
									<Option key={d} value={d}>
										{d}
									</Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item
							name='text'
							label='Nội dung câu hỏi'
							style={{ flex: 1 }}
							rules={[{ required: true, message: 'Nhập nội dung câu hỏi' }]}
						>
							<Input.TextArea rows={2} placeholder='Nhập nội dung câu hỏi tự luận' />
						</Form.Item>

						<Form.Item>
							<Button type='primary' htmlType='submit' style={{ marginTop: 30 }}>
								Thêm câu hỏi
							</Button>
						</Form.Item>
					</Space>
				</Form>

				<Space style={{ margin: '10px 0' }}>
					<Select
						allowClear
						placeholder='Lọc môn học'
						style={{ width: 180 }}
						onChange={(value: number) => setFilterSubject(value)}
					>
						{subjects.map((s) => (
							<Option key={s.id} value={s.id}>
								{s.name}
							</Option>
						))}
					</Select>
					<Select
						allowClear
						placeholder='Lọc khối kiến thức'
						style={{ width: 180 }}
						onChange={(value: number) => setFilterArea(value)}
					>
						{areas.map((a) => (
							<Option key={a.id} value={a.id}>
								{a.name}
							</Option>
						))}
					</Select>
					<Select
						allowClear
						placeholder='Lọc độ khó'
						style={{ width: 160 }}
						onChange={(value: Difficulty) => setFilterDifficulty(value)}
					>
						{difficulties.map((d) => (
							<Option key={d} value={d}>
								{d}
							</Option>
						))}
					</Select>
				</Space>

				<Table
					dataSource={filteredQuestions.map((item) => ({ ...item, key: item.id }))}
					columns={[
						{ title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
						{
							title: 'Môn học',
							dataIndex: 'subjectId',
							key: 'subjectId',
							render: (v) => subjects.find((s) => s.id === v)?.name || 'N/A',
						},
						{
							title: 'Kiến thức',
							dataIndex: 'areaId',
							key: 'areaId',
							render: (v) => areas.find((a) => a.id === v)?.name || 'N/A',
						},
						{ title: 'Mức độ', dataIndex: 'difficulty', key: 'difficulty' },
						{ title: 'Nội dung', dataIndex: 'text', key: 'text' },
					]}
					pagination={{ pageSize: 5 }}
				/>
			</Card>

			<Card title='4. Quản lý đề thi' style={{ minHeight: 420 }}>
				<Form layout='vertical' onFinish={createExam}>
					<Space wrap>
						<Form.Item name='name' label='Tên đề thi' rules={[{ required: true }]}>
							<Input style={{ width: 280 }} placeholder='Tên đề thi' />
						</Form.Item>
						<Form.Item name='subjectId' label='Môn thi' rules={[{ required: true }]}>
							<Select style={{ width: 220 }} placeholder='Chọn môn thi'>
								{subjects.map((subject) => (
									<Option key={subject.id} value={subject.id}>{`${subject.code} - ${subject.name}`}</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item name='easy' label='Số câu Dễ' initialValue={0} rules={[{ type: 'number', min: 0 }]}>
							<InputNumber min={0} />
						</Form.Item>
						<Form.Item name='medium' label='Số câu Trung bình' initialValue={0} rules={[{ type: 'number', min: 0 }]}>
							<InputNumber min={0} />
						</Form.Item>
						<Form.Item name='hard' label='Số câu Khó' initialValue={0} rules={[{ type: 'number', min: 0 }]}>
							<InputNumber min={0} />
						</Form.Item>
						<Form.Item name='veryHard' label='Số câu Rất khó' initialValue={0} rules={[{ type: 'number', min: 0 }]}>
							<InputNumber min={0} />
						</Form.Item>
						<Form.Item>
							<Button type='primary' htmlType='submit' style={{ marginTop: 8 }}>
								Tạo đề
							</Button>
						</Form.Item>
					</Space>
				</Form>

				<Typography.Title level={5} style={{ marginTop: 12 }}>
					Danh sách đề thi đã tạo
				</Typography.Title>

				<Table
					dataSource={exams.map((exam) => ({ ...exam, key: exam.id }))}
					columns={[
						{ title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
						{ title: 'Tên đề', dataIndex: 'name', key: 'name' },
						{
							title: 'Môn học',
							dataIndex: 'subjectId',
							key: 'subjectId',
							render: (v) => subjects.find((s) => s.id === v)?.name || 'N/A',
						},
						{
							title: 'Cấu trúc',
							dataIndex: 'structure',
							key: 'structure',
							render: (s) => `Dễ:${s.easy} TB:${s.medium} Khó:${s.hard} Rất khó:${s.veryHard}`,
						},
						{
							title: 'Số câu',
							key: 'count',
							render: (_, record) => record.questions.length,
						},
					]}
					pagination={{ pageSize: 4 }}
					expandable={{
						expandedRowRender: (record) => (
							<Table
								size='small'
								pagination={false}
								dataSource={record.questions.map((q) => ({ ...q, key: q.id }))}
								columns={[
									{ title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
									{
										title: 'Kiến thức',
										dataIndex: 'areaId',
										key: 'areaId',
										render: (v) => areas.find((a) => a.id === v)?.name || 'N/A',
									},
									{ title: 'Độ khó', dataIndex: 'difficulty', key: 'difficulty', width: 120 },
									{ title: 'Nội dung câu hỏi', dataIndex: 'text', key: 'text' },
								]}
							/>
						),
					}}
				/>
			</Card>
		</div>
	);
};

export default NganHangCauHoiPage;
