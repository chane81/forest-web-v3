// import { useState, useEffect } from 'react';
// import { useStore } from '~/store';
// import { apiCall } from '~/src/utils/fetchUtils';
// import { useRouter } from 'next/router';

// /** 세션체크 hooks */
// export const useAuth = () => {
// 	const [loading, setLoading] = useState(true);
// 	const [resData, setResData] = useState(null);
// 	const { loginInfoModel } = useStore();

// 	const getSessionCheck = async () => {
// 		setLoading(true);

// 		const res = await apiCall({ url: '/getSessionCheck' });

// 		setResData(res);
// 		setLoading(false);

// 		return res;
// 	};

// 	useEffect(() => {
// 		getSessionCheck();
// 	}, []);

// 	return [loading, !!loginInfoModel.userSeqNo && resData?.RESULT];
// };

export const temp = {};
