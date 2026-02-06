export interface Agent {
  id: string;
  name: string;
  type: 'itSpecialist' | 'highClass' | 'general' | 'youngCareer' | 'primary';
  tagline: string;
  description: string;
  features: string[];
  stats: {
    label: string;
    value: string;
  }[];
  bestFor: string[];
  cta: string;
  affiliateUrl: string;
}

export const agents: Agent[] = [
  // 最優先エージェント（アフィリエイト提携済み）
  {
    id: 'agent-navi',
    name: '転職AGENT Navi',
    type: 'primary',
    tagline: '約300人のアドバイザーから最適な担当者をマッチング',
    description: '求職者と転職エージェントの完全無料マッチングサービス。あなたの性格や希望に合わせて、内定実績のある約300人のキャリアアドバイザーの中から最適な担当者を紹介します。',
    features: [
      '業界最大級！求人保有100,000件以上',
      'Google評価★4.4以上の高評価',
      '相性の良いアドバイザーに出会える',
    ],
    stats: [
      { label: '求人数', value: '10万件+' },
      { label: 'Google評価', value: '★4.4以上' }
    ],
    bestFor: ['20代', '転職2回以内', '今すぐ〜3か月以内に転職したい方'],
    cta: '無料でアドバイザーを探す',
    affiliateUrl: 'https://px.a8.net/svt/ejp?a8mat=4AX1ON+CIP6HM+5BJK+5Z6WY',
  },
  {
    id: 'levtech',
    name: 'レバテックキャリア',
    type: 'itSpecialist',
    tagline: 'ITエンジニア特化No.1',
    description: 'IT・Web業界に完全特化した転職エージェント',
    features: [
      'エンジニア求人数15,000件以上',
      '元エンジニアのアドバイザーが多数',
      '年収アップ率60%以上'
    ],
    stats: [
      { label: 'IT求人数', value: '15,000件+' },
      { label: '年収UP率', value: '60%以上' }
    ],
    bestFor: ['エンジニア', 'IT業界経験者', '技術力を活かしたい方'],
    cta: '無料でIT求人を見る',
    affiliateUrl: '#',
  },
  {
    id: 'geekly',
    name: 'Geekly（ギークリー）',
    type: 'itSpecialist',
    tagline: 'IT・Web・ゲーム専門',
    description: 'IT/Web/ゲーム業界に特化した転職エージェント',
    features: [
      '業界専門のキャリアアドバイザー',
      'マッチング精度の高さに定評',
      '非公開求人が豊富'
    ],
    stats: [
      { label: '利用者満足度', value: '85%' },
      { label: '内定率', value: '業界トップクラス' }
    ],
    bestFor: ['Web系エンジニア', 'ゲーム業界志望', 'スタートアップ志向'],
    cta: '無料で相談する',
    affiliateUrl: '#',
  },
  {
    id: 'bizreach',
    name: 'ビズリーチ',
    type: 'highClass',
    tagline: 'ハイクラス転職No.1',
    description: '年収600万円以上のハイクラス転職に特化',
    features: [
      '企業やヘッドハンターから直接スカウト',
      '年収1,000万円以上の求人多数',
      '経営層・管理職向け求人が豊富'
    ],
    stats: [
      { label: '登録企業数', value: '17,000社+' },
      { label: 'スカウト数', value: '月間10万通+' }
    ],
    bestFor: ['年収600万円以上', 'マネジメント経験者', 'キャリアアップ志向'],
    cta: '無料でスカウトを受け取る',
    affiliateUrl: '#',
  },
  {
    id: 'jac',
    name: 'JACリクルートメント',
    type: 'highClass',
    tagline: 'ハイクラス・外資系に強い',
    description: '管理職・専門職・外資系企業への転職に特化',
    features: [
      '外資系・グローバル企業に強い',
      '両面型コンサルティング',
      '30代-50代のキャリア支援実績豊富'
    ],
    stats: [
      { label: '転職支援実績', value: '43万人+' },
      { label: '外資系求人', value: '業界最大級' }
    ],
    bestFor: ['外資系志望', '管理職経験者', '専門性の高い職種'],
    cta: '無料でキャリア相談',
    affiliateUrl: '#',
  },
  {
    id: 'recruit-agent',
    name: 'リクルートエージェント',
    type: 'general',
    tagline: '転職支援実績No.1',
    description: '業界最大級の求人数を誇る総合転職エージェント',
    features: [
      '非公開求人20万件以上',
      '全業界・全職種をカバー',
      '転職支援実績No.1'
    ],
    stats: [
      { label: '求人数', value: '60万件+' },
      { label: '転職支援実績', value: 'No.1' }
    ],
    bestFor: ['幅広く求人を見たい', '業界を変えたい', '初めての転職'],
    cta: '無料で求人を探す',
    affiliateUrl: '#',
  },
  {
    id: 'doda',
    name: 'doda',
    type: 'general',
    tagline: '求人数トップクラス',
    description: '転職サイトとエージェントが一体化したサービス',
    features: [
      '求人数10万件以上',
      'サイトとエージェント両方使える',
      '転職フェアなどイベントも充実'
    ],
    stats: [
      { label: '求人数', value: '10万件+' },
      { label: '利用者数', value: '700万人+' }
    ],
    bestFor: ['自分のペースで探したい', '20-30代', '情報収集から始めたい'],
    cta: '無料で会員登録',
    affiliateUrl: '#',
  },
  {
    id: 'mynavi-agent',
    name: 'マイナビエージェント',
    type: 'youngCareer',
    tagline: '20代・第二新卒に強い',
    description: '20代の転職サポートに定評のあるエージェント',
    features: [
      '20代の転職支援に特化',
      '初めての転職でも安心のサポート',
      '中小企業の優良求人も豊富'
    ],
    stats: [
      { label: '20代利用率', value: '業界トップ' },
      { label: '定着率', value: '97.5%' }
    ],
    bestFor: ['20代', '第二新卒', '初めての転職'],
    cta: '無料でキャリア相談',
    affiliateUrl: '#',
  },
  {
    id: 'workport',
    name: 'ワークポート',
    type: 'youngCareer',
    tagline: '未経験からのIT転職に強い',
    description: 'IT業界への転職・未経験転職に強いエージェント',
    features: [
      'IT未経験からの転職実績豊富',
      'スピーディーな対応',
      '転職決定人数が多い'
    ],
    stats: [
      { label: '転職決定人数', value: '業界トップクラス' },
      { label: '未経験IT転職', value: '実績豊富' }
    ],
    bestFor: ['IT業界未経験', 'キャリアチェンジ', '20-30代'],
    cta: '無料で相談する',
    affiliateUrl: '#',
  },
];

export interface MatchedAgent extends Agent {
  matchReasons: string[];
  matchScore: number;
}

export interface AgentMatchReasons {
  itSpecialist: { applicable: boolean; reasons: string[] };
  highClass: { applicable: boolean; reasons: string[] };
  general: { applicable: boolean; reasons: string[] };
  youngCareer: { applicable: boolean; reasons: string[] };
}

export function matchAgentsWithReasons(
  matchReasons: AgentMatchReasons,
  maxResults: number = 3
): MatchedAgent[] {
  const results: MatchedAgent[] = [];
  
  // 最優先: 転職AGENT Navi を必ず1番目に追加
  const primaryAgent = agents.find(a => a.type === 'primary');
  if (primaryAgent) {
    results.push({
      ...primaryAgent,
      matchReasons: [
        'あなたに合ったアドバイザーをマッチングしてくれる',
        '10万件以上の求人から最適な案件を紹介',
        '完全無料で相談できる',
      ],
      matchScore: 98,
    });
  }
  
  // 各タイプから該当するエージェントを選択
  const typeOrder: (keyof AgentMatchReasons)[] = ['itSpecialist', 'highClass', 'general', 'youngCareer'];
  
  // 適用可能なタイプを優先度順にソート
  const applicableTypes = typeOrder.filter(type => matchReasons[type].applicable);
  
  for (const type of applicableTypes) {
    const typeAgents = agents.filter(a => a.type === type);
    const reasons = matchReasons[type].reasons;
    
    for (const agent of typeAgents) {
      if (results.length >= maxResults) break;
      if (results.find(r => r.id === agent.id)) continue;
      
      results.push({
        ...agent,
        matchReasons: reasons,
        matchScore: applicableTypes.indexOf(type) === 0 ? 95 : 85,
      });
    }
    
    if (results.length >= maxResults) break;
  }
  
  // 足りない場合は総合型から補充
  if (results.length < maxResults) {
    const generalAgents = agents.filter(a => a.type === 'general');
    for (const agent of generalAgents) {
      if (results.length >= maxResults) break;
      if (results.find(r => r.id === agent.id)) continue;
      
      results.push({
        ...agent,
        matchReasons: matchReasons.general.reasons.length > 0 
          ? matchReasons.general.reasons 
          : ['幅広い求人から選択肢を広げられる', '業界最大級の求人数で比較検討しやすい'],
        matchScore: 80,
      });
    }
  }
  
  return results.slice(0, maxResults);
}
