(function(global) {
  'use strict';

  const TestConfig = {
    mbti: {
      id: 'mbti',
      name: 'MBTI人格测试',
      icon: '🧠',
      description: '16型人格，探索你的思维模式与行为偏好',
      duration: '15分钟',
      questionsCount: 60,
      category: 'personality',
      categoryName: '人格测试',
      difficulty: '基础',
      dimensions: ['EI', 'SN', 'TF', 'JP'],
      type: 'personality',
      calculate: function(answers) {
        const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
        answers.forEach((answer, index) => {
          const dim = this.questions[index].dimension;
          scores[dim] += this.questions[index].scores[answer];
        });
        let result = '';
        result += scores.EI >= 0 ? 'E' : 'I';
        result += scores.SN >= 0 ? 'S' : 'N';
        result += scores.TF >= 0 ? 'T' : 'F';
        result += scores.JP >= 0 ? 'J' : 'P';
        return { type: result, scores };
      },
      interpret: function(type) {
        const interpretations = {
          'INTJ': { name: '建筑师', desc: '富有想象力和战略性的思想家' },
          'INTP': { name: '逻辑学家', desc: '具有创造力的发明家' },
          'ENTJ': { name: '指挥官', desc: '大胆的领导者' },
          'ENTP': { name: '辩论家', desc: '聪明好奇的思考者' },
          'INFJ': { name: '提倡者', desc: '安静而有影响力的理想主义者' },
          'INFP': { name: '调停者', desc: '诗意善良的利他主义者' },
          'ENFJ': { name: '主人公', desc: '富有想象力的领导者' },
          'ENFP': { name: '竞选者', desc: '热情而有创造力的鼓舞者' },
          'ISTJ': { name: '物流师', desc: '务实且注重事实' },
          'ISFJ': { name: '守护者', desc: '温暖而专注的守护者' },
          'ESTJ': { name: '总经理', desc: '出色的管理者' },
          'ESFJ': { name: '执政官', desc: '热心且善于社交' },
          'ISTP': { name: '鉴赏家', desc: '大胆而实用的实验者' },
          'ISFP': { name: '探险家', desc: '灵活又有魅力的艺术家' },
          'ESTP': { name: '企业家', desc: '聪明且精力充沛' },
          'ESFP': { name: '表演者', desc: '自发且热心的娱乐者' }
        };
        return interpretations[type] || { name: '未知类型', desc: '请重新测试' };
      }
    },
    gad7: {
      id: 'gad7',
      name: '焦虑自评量表',
      icon: '😰',
      description: '评估你的焦虑程度',
      duration: '3分钟',
      questionsCount: 7,
      category: 'mental',
      categoryName: '心理健康',
      difficulty: '基础',
      type: 'scale',
      calculate: function(answers) {
        const total = answers.reduce((sum, val) => sum + val, 0);
        let level, suggestion;
        if (total <= 4) { level = '无明显焦虑'; suggestion = '保持良好的生活习惯'; }
        else if (total <= 9) { level = '轻度焦虑'; suggestion = '建议适当放松和休息'; }
        else if (total <= 14) { level = '中度焦虑'; suggestion = '建议咨询心理专业人士'; }
        else if (total <= 19) { level = '中重度焦虑'; suggestion = '建议尽快寻求专业帮助'; }
        else { level = '重度焦虑'; suggestion = '需要立即寻求专业治疗'; }
        return { score: total, level, suggestion };
      }
    },
    phq9: {
      id: 'phq9',
      name: '抑郁自评量表',
      icon: '😔',
      description: '评估你的抑郁程度',
      duration: '5分钟',
      questionsCount: 9,
      category: 'mental',
      categoryName: '心理健康',
      difficulty: '基础',
      type: 'scale',
      calculate: function(answers) {
        const total = answers.reduce((sum, val) => sum + val, 0);
        let level, suggestion;
        if (total <= 4) { level = '无明显抑郁'; suggestion = '继续保持'; }
        else if (total <= 9) { level = '轻度抑郁'; suggestion = '建议适当运动和社交'; }
        else if (total <= 14) { level = '中度抑郁'; suggestion = '建议咨询心理专业人士'; }
        else if (total <= 19) { level = '中重度抑郁'; suggestion = '建议尽快寻求专业帮助'; }
        else { level = '重度抑郁'; suggestion = '需要立即寻求专业治疗'; }
        return { score: total, level, suggestion };
      }
    },
    eq: {
      id: 'eq',
      name: '情商测试',
      icon: '💎',
      description: '评估你的情绪智力',
      duration: '10分钟',
      questionsCount: 16,
      category: 'emotion',
      categoryName: '情感能力',
      difficulty: '基础',
      dimensions: ['自我认知', '情绪管理', '自我激励', '同理心', '社交技能'],
      type: 'personality',
      calculate: function(answers) {
        const scores = [0, 0, 0, 0, 0];
        const sections = [3, 3, 3, 3, 4];
        let idx = 0;
        sections.forEach((count, dimIdx) => {
          for (let i = 0; i < count; i++) {
            scores[dimIdx] += answers[idx++];
          }
        });
        const total = scores.reduce((a, b) => a + b, 0);
        const avg = total / 5;
        let level = avg >= 24 ? '非常高' : avg >= 18 ? '较高' : avg >= 12 ? '一般' : '需提升';
        return { score: total, dimensions: scores, level };
      }
    },
    sds: {
      id: 'sds',
      name: '抑郁自评量表(SDS)',
      icon: '🌙',
      description: '评估抑郁状态',
      duration: '5分钟',
      questionsCount: 20,
      category: 'mental',
      categoryName: '心理健康',
      difficulty: '基础',
      type: 'scale',
      calculate: function(answers) {
        const total = answers.reduce((sum, val) => sum + val, 0);
        const index = Math.round(total * 1.25);
        let level;
        if (index < 53) level = '无明显抑郁';
        else if (index < 63) level = '轻度抑郁';
        else if (index < 73) level = '中度抑郁';
        else level = '重度抑郁';
        return { score: total, index, level };
      }
    },
    sas: {
      id: 'sas',
      name: '焦虑自评量表(SAS)',
      icon: '😟',
      description: '评估焦虑状态',
      duration: '5分钟',
      questionsCount: 20,
      category: 'mental',
      categoryName: '心理健康',
      difficulty: '基础',
      type: 'scale',
      calculate: function(answers) {
        const total = answers.reduce((sum, val) => sum + val, 0);
        const index = Math.round(total * 1.25);
        let level;
        if (index < 50) level = '无明显焦虑';
        else if (index < 60) level = '轻度焦虑';
        else if (index < 70) level = '中度焦虑';
        else level = '重度焦虑';
        return { score: total, index, level };
      }
    },
    scl90: {
      id: 'scl90',
      name: '症状自评量表',
      icon: '🧩',
      description: '评估心理健康状态',
      duration: '15分钟',
      questionsCount: 90,
      category: 'mental',
      categoryName: '心理健康',
      difficulty: '进阶',
      dimensions: ['躯体化', '强迫', '人际关系', '抑郁', '焦虑', '敌对', '恐怖', '偏执', '精神病性'],
      type: 'symptom',
      calculate: function(answers) {
        const dims = [12, 10, 9, 13, 10, 6, 7, 8, 10];
        const scores = [];
        let idx = 0;
        dims.forEach((count, i) => {
          let sum = 0;
          for (let j = 0; j < count; j++) sum += answers[idx++];
          scores.push((sum / count).toFixed(2));
        });
        const total = answers.reduce((a, b) => a + b, 0) / answers.length;
        return { dimensions: scores, average: total.toFixed(2) };
      }
    }
  };

  const TestQuestions = {
    mbti: [
      { dimension: 'EI', difficulty: 1, question: '在社交聚会中，你通常会：', options: ['主动与所有人交流', '与熟悉的人交流', '只与几个熟人交流', '独自安静'], scores: [4, 2, 1, 0], explanation: '外倾(E)倾向者从外部世界获取能量' },
      { dimension: 'EI', difficulty: 1, question: '当你参加派对时，你倾向于：', options: ['成为焦点，与大家互动', '与部分人交流', '找一个安静的角落观察', '尽快离开'], scores: [4, 2, 1, 0], explanation: '外倾型人格喜欢成为社交场合的中心' },
      { dimension: 'EI', difficulty: 1, question: '在陌生人面前，你通常：', options: ['很快就能够交谈', '稍后会主动交流', '等待别人先开口', '尽量避免交流'], scores: [4, 2, 1, 0], explanation: '外倾者更容易主动打破陌生感' },
      { dimension: 'EI', difficulty: 1, question: '你更喜欢：', options: ['与人交流获取能量', '比较喜欢社交', '独处获取能量', '完全独自'], scores: [4, 2, 1, 0], explanation: '能量的获取方式决定了人格倾向' },
      { dimension: 'EI', difficulty: 1, question: '在社交场合，你通常：', options: ['主动认识新朋友', '愿意认识新朋友', '等待朋友介绍', '只与熟人交流'], scores: [4, 2, 1, 0], explanation: '外倾者主动拓展社交圈' },
      { dimension: 'EI', difficulty: 1, question: '你更容易在：', options: ['人多的地方精力充沛', '适当社交时精力充沛', '独处时精力充沛', '完全需要独处'], scores: [4, 2, 1, 0], explanation: '外倾者从人际互动中获得能量' },
      { dimension: 'EI', difficulty: 1, question: '当你需要休息时，你会：', options: ['找朋友聊天', '有时找人聊天', '独自安静地待着', '完全独自'], scores: [4, 2, 1, 0], explanation: '休息方式反映了你的能量获取偏好' },
      { dimension: 'EI', difficulty: 1, question: '在会议上，你通常：', options: ['积极参与讨论', '有时参与讨论', '先聆听再发言', '基本不发言'], scores: [4, 2, 1, 0], explanation: '外倾者倾向于即时表达观点' },
      { dimension: 'EI', difficulty: 1, question: '你喜欢的工作环境是：', options: ['完全开放协作', '比较开放', '独立专注', '完全独立'], scores: [4, 2, 1, 0], explanation: '开放环境适合外倾者' },
      { dimension: 'EI', difficulty: 1, question: '当你遇到问题时，你会：', options: ['立即与人讨论', '会找人讨论', '先自己思考', '完全自己思考'], scores: [4, 2, 1, 0], explanation: '外倾者通过讨论思考' },
      { dimension: 'EI', difficulty: 1, question: '你的沟通风格更倾向于：', options: ['非常直接了当', '比较直接', '比较委婉', '非常委婉'], scores: [4, 2, 1, 0], explanation: '外倾者偏好直接沟通' },
      { dimension: 'EI', difficulty: 1, question: '在新环境中，你通常：', options: ['快速适应并融入', '较快适应', '观察一段时间再行动', '需要很长时间适应'], scores: [4, 2, 1, 0], explanation: '外倾者快速适应新环境' },
      { dimension: 'EI', difficulty: 1, question: '你更喜欢：', options: ['电话或面对面交流', '比较喜欢即时交流', '文字信息交流', '更喜欢文字交流'], scores: [4, 2, 1, 0], explanation: '外倾者偏好即时沟通方式' },
      { dimension: 'EI', difficulty: 1, question: '面对陌生人，你会：', options: ['主动自我介绍', '稍后会自我介绍', '等待对方先介绍', '尽量避免接触'], scores: [4, 2, 1, 0], explanation: '这是外倾/内倾在社交场合的典型表现' },
      { dimension: 'EI', difficulty: 2, question: '当你独自工作很长时间后，你会：', options: ['非常渴望找人聊天', '有些渴望社交', '享受独处的宁静', '完全享受独处'], scores: [4, 2, 1, 0], explanation: '长时间独处后对社交的渴望程度' },
      { dimension: 'SN', difficulty: 1, question: '在做决定时，你更依赖：', options: ['完全依赖实际经验', '比较依赖经验', '依赖直觉和可能性', '完全依赖直觉'], scores: [4, 2, 1, 0], explanation: '感觉型(S)依赖具体事实，直觉型(N)依赖可能性' },
      { dimension: 'SN', difficulty: 1, question: '你更喜欢：', options: ['完全具体可操作', '比较具体', '理论和概念', '完全抽象'], scores: [4, 2, 1, 0], explanation: '感觉型偏好实用信息' },
      { dimension: 'SN', difficulty: 1, question: '你更容易记住：', options: ['完全具体事实', '比较偏细节', '整体印象和感觉', '完全整体感觉'], scores: [4, 2, 1, 0], explanation: '感觉型善于记忆细节' },
      { dimension: 'SN', difficulty: 1, question: '你更关注：', options: ['完全现实问题', '比较关注现实', '未来可能发展', '完全关注未来'], scores: [4, 2, 1, 0], explanation: '感觉型关注当下现实' },
      { dimension: 'SN', difficulty: 1, question: '在学习新事物时，你喜欢：', options: ['完全动手实践', '比较偏实践', '理论研究', '完全理论'], scores: [4, 2, 1, 0], explanation: '感觉型偏好实践学习' },
      { dimension: 'SN', difficulty: 1, question: '你更倾向于：', options: ['完全遵循传统', '比较传统', '尝试创新方法', '完全创新'], scores: [4, 2, 1, 0], explanation: '感觉型尊重传统经验' },
      { dimension: 'SN', difficulty: 1, question: '你更容易相信：', options: ['完全亲眼所见', '比较相信实际', '所想象的', '完全相信想象'], scores: [4, 2, 1, 0], explanation: '感觉型相信直接经验' },
      { dimension: 'SN', difficulty: 1, question: '你更喜欢：', options: ['完全明确指示', '比较明确', '灵活自主空间', '完全自主'], scores: [4, 2, 1, 0], explanation: '感觉型需要明确指示' },
      { dimension: 'SN', difficulty: 1, question: '在解决问题时，你更看重：', options: ['完全实用方案', '比较实用', '优雅方案', '完全优雅'], scores: [4, 2, 1, 0], explanation: '感觉型重视实用性' },
      { dimension: 'SN', difficulty: 1, question: '你更关注：', options: ['完全当前事实', '比较关注当下', '长远影响', '完全长远'], scores: [4, 2, 1, 0], explanation: '感觉型关注当前现实' },
      { dimension: 'SN', difficulty: 2, question: '当你学习一门新课程时，你首先会：', options: ['完全了解实际应用', '偏重实际', '理解背后原理', '完全理论'], scores: [4, 2, 1, 0], explanation: '学习的切入点反映感觉/直觉偏好' },
      { dimension: 'SN', difficulty: 2, question: '你看小说时更关注：', options: ['完全情节细节', '比较偏情节', '主题象征意义', '完全象征'], scores: [4, 2, 1, 0], explanation: '阅读关注点反映认知风格' },
      { dimension: 'SN', difficulty: 2, question: '面对新项目，你首先会：', options: ['完全查看案例经验', '偏重经验', '思考创新可能', '完全创新'], scores: [4, 2, 1, 0], explanation: '项目启动方式反映感觉/直觉偏好' },
      { dimension: 'TF', difficulty: 1, question: '在做决定时，你更注重：', options: ['完全逻辑客观', '比较理性', '个人价值观感受', '完全情感'], scores: [4, 2, 1, 0], explanation: '思考型(T)依赖逻辑，情感型(F)依赖价值观' },
      { dimension: 'TF', difficulty: 1, question: '当别人犯错时，你会：', options: ['完全指出错误', '会指出错误', '考虑对方感受', '完全照顾情绪'], scores: [4, 2, 1, 0], explanation: '思考型注重对错，情感型注重关系' },
      { dimension: 'TF', difficulty: 1, question: '你更相信：', options: ['完全理性思考', '比较理性', '内心感受', '完全感性'], scores: [4, 2, 1, 0], explanation: '决策依据反映思维偏好' },
      { dimension: 'TF', difficulty: 1, question: '在争论中，你更看重：', options: ['完全谁对谁错', '比较对错', '维护关系', '完全和谐'], scores: [4, 2, 1, 0], explanation: '争论关注点反映决策风格' },
      { dimension: 'TF', difficulty: 1, question: '你更容易被什么说服：', options: ['完全数据和事实', '偏重事实', '情感价值观', '完全情感'], scores: [4, 2, 1, 0], explanation: '说服力来源反映思维偏好' },
      { dimension: 'TF', difficulty: 1, question: '当你安慰别人时，你会：', options: ['完全提供方案', '会提供方案', '倾听理解', '完全倾听'], scores: [4, 2, 1, 0], explanation: '安慰方式反映思考/情感的差异' },
      { dimension: 'TF', difficulty: 1, question: '你更倾向于：', options: ['完全公平对待', '比较公平', '因人而异', '完全因人'], scores: [4, 2, 1, 0], explanation: '思考型倾向一致标准，情感型倾向因人而异' },
      { dimension: 'TF', difficulty: 1, question: '你认为更重要的是：', options: ['完全理性', '比较理性', '情感', '完全情感'], scores: [4, 2, 1, 0], explanation: '价值观核心反映思维偏好' },
      { dimension: 'TF', difficulty: 1, question: '在做决定时，你通常会：', options: ['完全客观分析', '偏重分析', '考虑各方感受', '完全感性'], scores: [4, 2, 1, 0], explanation: '决策过程反映思考/情感的差异' },
      { dimension: 'TF', difficulty: 2, question: '在选择职业时，你更看重：', options: ['完全发展前景薪资', '偏重发展', '意义价值感', '完全意义'], scores: [4, 2, 1, 0], explanation: '职业选择标准反映思考/情感偏好' },
      { dimension: 'TF', difficulty: 2, question: '你更容易原谅：', options: ['完全逻辑错误', '比较理性', '情感伤害', '完全情感'], scores: [4, 2, 1, 0], explanation: '原谅的难易程度反映情感偏好' },
      { dimension: 'TF', difficulty: 2, question: '在团队冲突中，你会：', options: ['完全分析对错', '偏重分析', '调解情绪', '完全调和'], scores: [4, 2, 1, 0], explanation: '冲突处理方式反映思维偏好' },
      { dimension: 'JP', difficulty: 1, question: '面对截止日期，你会：', options: ['完全提前规划', '比较提前', '最后冲刺', '完全拖延'], scores: [4, 2, 1, 0], explanation: '判断型(J)偏好提前完成' },
      { dimension: 'JP', difficulty: 1, question: '你更喜欢：', options: ['完全有计划', '比较计划', '随遇而安', '完全随意'], scores: [4, 2, 1, 0], explanation: '生活方式偏好反映判断/知觉的差异' },
      { dimension: 'JP', difficulty: 1, question: '在工作中，你倾向于：', options: ['完全按计划', '偏重计划', '随时调整', '完全灵活'], scores: [4, 2, 1, 0], explanation: '工作方式反映判断/知觉偏好' },
      { dimension: 'JP', difficulty: 1, question: '你更喜欢：', options: ['完全确定性', '比较确定', '灵活应变', '完全灵活'], scores: [4, 2, 1, 0], explanation: '对确定性的偏好反映J/P差异' },
      { dimension: 'JP', difficulty: 1, question: '当你要出门时，你会：', options: ['完全提前准备', '比较提前', '临出门再收拾', '完全临时'], scores: [4, 2, 1, 0], explanation: '准备方式反映判断/知觉偏好' },
      { dimension: 'JP', difficulty: 1, question: '你更喜欢：', options: ['完全详细清单', '比较详细', '想到做什么', '完全随意'], scores: [4, 2, 1, 0], explanation: '任务管理方式反映J/P差异' },
      { dimension: 'JP', difficulty: 1, question: '在项目中，你更喜欢：', options: ['完全严格计划', '比较严格', '随情况变化', '完全随意'], scores: [4, 2, 1, 0], explanation: '项目管理风格反映判断/知觉偏好' },
      { dimension: 'JP', difficulty: 1, question: '你更容易感到焦虑的是：', options: ['完全没有完成计划', '比较担心计划', '计划变化', '完全不怕变化'], scores: [4, 2, 1, 0], explanation: '焦虑源反映J/P的差异' },
      { dimension: 'JP', difficulty: 1, question: '你更喜欢：', options: ['完全一次性完成', '比较集中', '分多次完成', '完全分散'], scores: [4, 2, 1, 0], explanation: '任务完成方式反映判断/知觉偏好' },
      { dimension: 'JP', difficulty: 1, question: '面对新任务，你会：', options: ['完全制定计划', '比较计划', '边做边想', '完全随意'], scores: [4, 2, 1, 0], explanation: '任务启动方式反映J/P差异' },
      { dimension: 'JP', difficulty: 1, question: '你更倾向于：', options: ['完全提前准备', '比较提前', '船到桥头自然直', '完全临时'], scores: [4, 2, 1, 0], explanation: '准备态度反映判断/知觉偏好' },
      { dimension: 'JP', difficulty: 1, question: '你更喜欢：', options: ['完全有组织环境', '比较有序', '自由空间', '完全自由'], scores: [4, 2, 1, 0], explanation: '工作环境偏好反映J/P差异' },
      { dimension: 'JP', difficulty: 2, question: '你的房间/桌面通常：', options: ['完全整洁有序', '比较整洁', '有些凌乱', '完全随性'], scores: [4, 2, 1, 0], explanation: '生活环境反映J/P偏好' },
      { dimension: 'JP', difficulty: 2, question: '你更习惯：', options: ['完全按日程行事', '比较守时', '灵活安排', '完全随意'], scores: [4, 2, 1, 0], explanation: '时间观念反映判断/知觉偏好' },
      { dimension: 'JP', difficulty: 2, question: '面对意外情况，你通常：', options: ['有备用方案', '有一些准备', '灵活应变', '完全随机应变'], scores: [4, 2, 1, 0], explanation: '应对意外的方式反映J/P差异' }
    ],
    gad7: [
      { question: '感到紧张、焦虑或不安', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '对事情缺乏兴趣或动力', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '感到心情低落、沮丧或绝望', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '入睡困难、睡眠质量差', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '感到疲倦或缺乏活力', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '食欲不振或暴饮暴食', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '自我感觉糟糕或觉得自己很失败', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] }
    ],
    phq9: [
      { question: '对事物缺乏兴趣或乐趣', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '感到心情低落、沮丧或绝望', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '入睡困难或睡眠过多', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '感到疲倦或缺乏活力', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '食欲不振或暴饮暴食', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '自我感觉糟糕或觉得自己很失败', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '集中注意力困难', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '动作或说话速度缓慢，或相反', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] },
      { question: '有自我伤害或自杀念头', options: ['完全没有', '好几天', '一半以上时间', '几乎每天'], scores: [0, 1, 2, 3] }
    ],
    eq: [
      { dimension: 0, question: '我能准确识别自己的情绪', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 0, question: '我了解自己情绪产生的原因', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 0, question: '我能察觉到自己情绪的变化', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 1, question: '我能够控制自己的情绪', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 1, question: '我能够在压力下保持冷静', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 1, question: '我能够调节自己的负面情绪', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 2, question: '我能从挫折中快速恢复', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 2, question: '我对未来充满希望', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 2, question: '我能激励自己完成目标', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 3, question: '我能理解别人的感受', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 3, question: '我能够站在别人的角度思考', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 3, question: '我对别人的情绪变化敏感', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 4, question: '我善于与人沟通', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 4, question: '我能够建立和维护良好的人际关系', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 4, question: '我能够妥善处理人际冲突', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] },
      { dimension: 4, question: '我能够在团队中发挥作用', options: ['完全不符合', '不太符合', '比较符合', '完全符合'], scores: [1, 2, 3, 4] }
    ],
    sds: Array.from({ length: 20 }, (_, i) => ({
      question: `题目${i + 1}`,
      options: ['没有或很少时间', '小部分时间', '相当多时间', '绝大部分或全部时间'],
      scores: [1, 2, 3, 4]
    })),
    sas: Array.from({ length: 20 }, (_, i) => ({
      question: `题目${i + 1}`,
      options: ['没有或很少时间', '小部分时间', '相当多时间', '绝大部分或全部时间'],
      scores: [1, 2, 3, 4]
    })),
    scl90: Array.from({ length: 90 }, (_, i) => ({
      question: `症状题目${i + 1}`,
      options: ['从无', '轻度', '中度', '偏重', '严重'],
      scores: [1, 2, 3, 4, 5]
    }))
  };

  TestConfig.mbti.questions = TestQuestions.mbti;
  TestConfig.gad7.questions = TestQuestions.gad7;
  TestConfig.phq9.questions = TestQuestions.phq9;
  TestConfig.eq.questions = TestQuestions.eq;
  TestConfig.sds.questions = TestQuestions.sds;
  TestConfig.sas.questions = TestQuestions.sas;
  TestConfig.scl90.questions = TestQuestions.scl90;

  const DataAPI = {
    getTest: function(id) {
      const config = TestConfig[id];
      if (!config) return null;
      return {
        config: config,
        questions: TestQuestions[id] || []
      };
    },
    getAllTests: function() {
      return Object.keys(TestConfig).map(id => ({
        id,
        ...TestConfig[id]
      }));
    },
    getTestsByCategory: function(category) {
      return Object.keys(TestConfig)
        .filter(id => TestConfig[id].category === category)
        .map(id => ({ id, ...TestConfig[id] }));
    },
    getCategories: function() {
      const categories = {};
      Object.keys(TestConfig).forEach(id => {
        const cat = TestConfig[id].category;
        if (!categories[cat]) {
          categories[cat] = {
            id: cat,
            name: TestConfig[id].categoryName,
            tests: []
          };
        }
        categories[cat].tests.push({ id, ...TestConfig[id] });
      });
      return Object.values(categories);
    },
    calculate: function(id, answers) {
      const test = TestConfig[id];
      if (!test || !test.calculate) return null;
      return test.calculate(answers);
    }
  };

  global.TEST_DATA = TestConfig;
  global.TEST_QUESTIONS = TestQuestions;
  global.TestAPI = DataAPI;

})(window);
