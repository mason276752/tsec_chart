import {
	Bar,
	HistoryMetadata,
	LibrarySymbolInfo,
} from 'datafeed-api';

import {
	getErrorMessage,
	RequestParams,
	UdfErrorResponse,
	UdfOkResponse,
	UdfResponse,
} from './helpers';

import { Requester } from './requester';
import * as csvtojson from 'csvtojson'


interface HistoryPartialDataResponse extends UdfOkResponse {
	t: number[];
	c: number[];
	o?: never;
	h?: never;
	l?: never;
	v?: never;
}

interface HistoryFullDataResponse extends UdfOkResponse {
	t: number[];
	c: number[];
	o: number[];
	h: number[];
	l: number[];
	v: number[];
}

interface HistoryNoDataResponse extends UdfResponse {
	s: 'no_data';
	nextTime?: number;
}

type HistoryResponse = HistoryFullDataResponse | HistoryPartialDataResponse | HistoryNoDataResponse;

export interface GetBarsResult {
	bars: Bar[];
	meta: HistoryMetadata;
}

export class HistoryProvider {
	private _datafeedUrl: string;
	private readonly _requester: Requester;

	public constructor(datafeedUrl: string, requester: Requester) {
		this._datafeedUrl = datafeedUrl;
		this._requester = requester;
	}

	public getBars(symbolInfo: LibrarySymbolInfo, resolution: string, rangeStartDate: number, rangeEndDate: number): Promise<GetBarsResult> {
		const requestParams: RequestParams = {
			symbol: symbolInfo.ticker + '.csv' || '',
			// resolution: resolution,
			// from: rangeStartDate,
			// to: rangeEndDate,
		};

		return new Promise((resolve: (result: GetBarsResult) => void, reject: (reason: string) => void) => {
			this._requester.sendRequest<HistoryResponse>(this._datafeedUrl, 'data', requestParams)
				.then((response: HistoryResponse | UdfErrorResponse) => {
					///
					return <any> csvtojson({ noheader: true }).
						fromString(<any>(response))
						.then((v:any)=>{
							v = v.map((v:any) => {
							let datere = /(.+)\/(.+)\/(.+)/g
							let [, y, m, d] = <any>datere.exec(v.field1);
							let date = new Date([Number(y) + 1911, m, Number(d)].join('/')).getTime() / 1000 + 86400
							return {
								time: date,
								transaction: v.field2,
								volume: v.field3,
								open: v.field4,
								high: v.field5,
								low: v.field6,
								close: v.field7,
								change: v.field8,
								transactionCount: v.field9
							}
						})
						v = v.filter((v:any) => v.volume !== "0")
						v = v.filter((v:any) => v.low !== "--")
						return <HistoryResponse>{
							t: v.reduce((x: any, y: any) => { x.push(y.time); return x; }, []),
							v: v.reduce((x: any, y: any) => { x.push(Number(y.volume)); return x; }, []),
							o: v.reduce((x: any, y: any) => { x.push(Number(y.open)); return x; }, []),
							c: v.reduce((x: any, y: any) => { x.push(Number(y.close)); return x; }, []),
							h: v.reduce((x: any, y: any) => { x.push(Number(y.high)); return x; }, []),
							l: v.reduce((x: any, y: any) => { x.push(Number(y.low)); return x; }, []),
							s: 'ok'
						}
					})
				}).then((response: HistoryResponse | UdfErrorResponse) => {
					
					if (response.s !== 'ok' && response.s !== 'no_data') {
						reject(response.errmsg);
						return;
					}

					const bars: Bar[] = [];
					const meta: HistoryMetadata = {
						noData: false,
					};

					if (response.s === 'no_data') {
						meta.noData = true;
						meta.nextTime = response.nextTime;
					} else {
						const volumePresent = response.v !== undefined;
						const ohlPresent = response.o !== undefined;

						for (let i = 0; i < response.t.length; ++i) {
							const barValue: Bar = {
								time: response.t[i] * 1000,
								close: Number(response.c[i]),
								open: Number(response.c[i]),
								high: Number(response.c[i]),
								low: Number(response.c[i]),
							};

							if (ohlPresent) {
								barValue.open = Number((response as HistoryFullDataResponse).o[i]);
								barValue.high = Number((response as HistoryFullDataResponse).h[i]);
								barValue.low = Number((response as HistoryFullDataResponse).l[i]);
							}

							if (volumePresent) {
								barValue.volume = Number((response as HistoryFullDataResponse).v[i]);
							}

							bars.push(barValue);
						}
					}

					resolve({
						bars: bars,
						meta: meta,
					});
				})
				.catch((reason?: string | Error) => {
					const reasonString = getErrorMessage(reason);
					console.warn(`HistoryProvider: getBars() failed, error=${reasonString}`);
					reject(reasonString);
				});
		});
	}
}
