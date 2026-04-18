export interface CricApiMatchPlayer {
  pid: string;
  name: string;
}

export interface CricApiMatchTeam {
  name: string;
  players: CricApiMatchPlayer[];
}

export interface CricApiBattingScore {
  pid: string;
  batsman: string;
  'dismissal-info': string;
  R: string;
  M: string;
  B: string;
  '4s': string;
  '6s': string;
  SR: string;
}

export interface CricApiBattingInning {
  title: string;
  scores: CricApiBattingScore[][];
}

export interface CricApiBowlingScore {
  pid: string;
  bowler: string;
  O: string;
  M: string;
  R: string;
  W: string;
  Econ: string;
  '0s': string;
}

export interface CricApiBowlingInning {
  title: string;
  scores: CricApiBowlingScore[][];
}

export interface CricApiFantasySummary {
  creditsLeft: number;
  data: {
    team: CricApiMatchTeam[];
    batting: CricApiBattingInning[];
    bowling: CricApiBowlingInning[];
    fielding: any[];
    'man-of-the-match': string;
  };
}

export async function fetchFantasySummary(uniqueId: string | number, apiKey: string): Promise<CricApiFantasySummary | { error: string }> {
  try {
    const response = await fetch('https://cricapi.com/api/fantasySummary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        unique_id: uniqueId,
        apikey: apiKey,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || `Cric API HTTP error: ${response.status}` };
    }
    if (data.error) {
      return { error: data.error };
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch from Cric API', error);
    return { error: error instanceof Error ? error.message : 'Unknown fetch error' };
  }
}
