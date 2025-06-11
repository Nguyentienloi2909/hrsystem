import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import {
    IconUsers,
    IconCurrencyDollar,
    IconChecklist,
} from '@tabler/icons-react';

// Dữ liệu cho carousel và navigation cards
const statisticsData = [
    {
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJUKsC408Q1xflTt8Qu91tPzy7Bqoq7HxG0g&s',
        title: 'Thống kê nhân viên',
        description: 'Phân tích nhân viên theo phòng ban, vai trò.',
        route: '/manage/statistics/employees',
        icon: (size) => <IconUsers size={size} />,
    },
    {
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUuSZCz69ESQKoZTKoG9jzmuXyMezodhxh7A&s',
        title: 'Thống kê lương',
        description: 'Xem chi tiết lương, thưởng, và các khoản khấu trừ.',
        route: '/manage/statistics/payroll',
        icon: (size) => <IconCurrencyDollar size={size} />,
    },
    {
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATcAAACiCAMAAAATIHpEAAACEFBMVEX////s7OzU2PODjuj/e6w4l+n/uhQumO7y8e+Robjq6uqBjevu7u78/PzZ2NjW2/Zxd8JkX2C1t8j//PYkesTQzs+vr7rIxsb/wAG8rJ7U0tPkpQCps8TN0Oa9ururq7ne4vrBxNiSlLrSaJDc2u5nYF3y8/vCv8TYnQCcr8gAAAC5i6H/zse+v9DHy+YUfc0wgsZ4j+fAZ43fY5Xl7+vl5/a4u9UqOVPIytXHtZBiYGS6mTV6hufPr3v/dKj/gbWf0/soGRyuteuUneegqOnAlB63nXy9pa5zf9yPksZ+gq/f8PlYvfmcnbgdj+m+w+/6z9/7jrb5wNVvfOR/fpvGqmn/8ah9nsb2nsCyr7Bfh7VofprBo6BqdMqBhsOMj7BvdLR4fK2WlJSt2/aZmKsjEhXI5vkmFhlENjaCf4D/5NvJtbLjwryiiYVzxvdJPTxNdLagdXHyrKb9npn+xb7hvrSky+7i2s1SXJV1r+hucZA7S5tOnealp8owZpolAAA3SqotT3VfY5QYNp5KSHoxP41MRD5lYnWhWHezcIr53uhgb+T+Vpj51Hf8xTb7zFL+25P78M/76LiSbIC9jqTNrUmaiFCOhWcAguVyWWFrq+hBIy1fNUiEu9aBR189JjDHfYPNfJuGrsJmo8eYcKZojZuzappSmbhUfZCgk4lNSmrQCm3IS4CzVHgAX6nCj4HLfoaUAAAY6ElEQVR4nO2di2MbRX7HRw9Hm92dlWxF2iDMSonNChTFdhwrBNhKjq3DioOlyAmN5ViJX8nh2JjHkQRK0uMopSQcRzlc2svhFMJxXK5Q/sXOzL4fsiXZK4mib2JbGo20q8/+5je/eS4AXXXVVVddddVVV1111VVXXXXVVVdddfX/ShBSFMuyHiT0h6IgbPcZNa0wH585evTujHDb5QNBivXQHotomqUg4ISZu0ePzkQjYZfPYb8U5qerEiOrEFql3TsSxdqYEbEUNxMqKKcgVaf5nwM6YVHCvK6cPXt2EfMrXHWHHKwBzeOhuOkC5rWITuEK5ictJl05hX0UvSQx0pUoJ19hKnK1yjDV6P4fpzY1loojVNWZCEUyhrkoupDSNLX/57CPilQZaSlCHkIv+ROOo6SrxoICkQvf47eoTQ1hm2aYUBwfUKsf+EWUFNvbIV2VUNCNS5xQHtDoiyzp4KD8lfdS6dWm5mHpJdW4llO92kGQCRb4PRzRXUUKTIgDIAOuryA+JZImigCsSsy0Bo5SvmDTR6FqU0OGjLCtyvnOXLt2prdXca5clSlwzX8zV0VXmRA+TRFef1lLFPEvBG5VTWDlL0g3aXDUDtA8nvBFRlINvvfamV9fS/Uqz26jk+tQH7fEVNVLunnd/NJVvZiwqmU0cwjI7oiNqhguUOXVVOrMq6k15SlXYKabOaTrEiRJUB+Pb5pfCy8yi0pJpZrntkN1oHxmiFnSci/fSG/cuHYt5VGexxmpI12c8ZzPvSyaX0SuTyk/Sr3QeDndlZqHihud2Ho6nd54ujelwULXrtFjtkCCVIiBjIprc8X42iAE09pJE79ON2puqEVF7aoQc1R/x8ZrGxvrG+uvaYWAl6RI49/LbU0Tc1OtaMVUUCE5aTWCQm1KtiY27nR/01plJEODeD29vpFOr7+uN1cWjVg7ROEqY2wWiC+fs7weYmZ2/5TYfLEYaFpvmAqicOPNN9MbWoUKsIcLdVxLlZfM8dHmuCXD0Tq8S7QY6NmDzJcmhqwtvXDGYNkRqfNiOHQtTc+vW2pUEGWqu13sSLGnJ1AcNqlOZDjroZB02vhx/Fu/efvmoiGBqjId18C/K10xJ7x8y/w8JhV2qwtGAj2By7dNnj58sB4LDMyHUd7bBcloTuF33k6nb7yzbOiOqctXtFZHmbOoTaVHH2Kx+K72BKIXELddOpRixZ7AQWtindxwVk4qGPtJl/5pPX1z7T3aIwhqo+4Kc7f5b+iOMLdMqaQ9v1UM3NGe4Bd25AZxmNEf6Bm2dRCbuJmrASVxROUWMR2Be4eXQoWLpI3AKzHcFanjuN1F3HTBzc13H5hr1BrcMDElakWIDtlcoJHbyHNG/TN5JfDb344o3IzlNLz0/vvv+JiL78m+gZaDuMXOK6d9xnrh+sub56wZkpKtXjCPDuzOrWfEKMUEf/ecam9UVY9rFy+Gw6vvnfhArQdoHDxaYqWOkMBUVbcPx19esWeYMcchkM0MDmZMrSRHbv27+TdcXgOXcFYUIsaVd8X+BZ0M/f7ye/r5QWKQHddC1ev465t2YwOmYB1SHsyMZZXhu524USN1BLyH5PI5rbaQucpFfJgPVw3FUiChkIujRE1K5bLiZGy4G0eSueLCmRlkKa6STCYrHMXuzA1Q/c/upn6FRlIJdQSaewH/XTtr6BznIVhirlAdN7gaxwU1kwHnHIwNtetn5HKMOzWooEgJ0aFEEOlUlKd25taAkM3jglphQS+O2uDyvxo+DvJ0gYmyNbjt2GZ2VeikZ0DNq0lelfveWC/LRb0JEQV16CfhrdDsPnEDV1GbhKqgB9fgMuJncG9IkatMiKrR7UfOoOE+mv3RzE49+Ogb0VDGM8jG+oIYGFYCisGoDG4fuHEF5iL2/LGPQCVGLS8vGl8UJCZeg5ti8u1xflRI69O1ST5nokyGjgaBTA0rA4PR/bI3dO1IKLK8BpZefyG6ikNKtQig2haZm/N4kOpi2+P8eEnuwTdNbCGPuSqzpLqxIFUJgqBKLYFNLlih9olbeJGMcawtgxik+lZxTaV0W4anmQLPdiQ3sMoweIR5kBweDpK0DHoSqzIhTqk3MyL/lJhRsYlARL8yR/Cr+8ENX6EQB3or5AziuFUlc0PYJGLxjtzUMbY9HrxpXWWYJfXg2rgziBaYakQdNh2kokGolVH0KjI9ZHD7xQ3PGKhGPiKwqCg2fxKK0FcYaVWulZzepIx5tG+ccFViqlH5uyvjzuD2tMSEItqw5yDVp5sbNswgNrg+ar+4kakWH8rc/m0VObsYJc+1kLHVGO+GHppuU3Uqq1LFszM0gw9H8NSgJVoLbulM5CnN3Ag47OTEPpRjn7gBepFhCkeRmVHLawhFWIiHGKYqqFeuxrvaPdsQmxdTWLzbl0weP0UmwoWiepsAceO9Jm7Y9oLiKW7/uCHHgEBJoaMzfaeTx+8uogvnm7kdVtRx7QVNMTx3i5Ek/B8RjNPGqQkZE7cMMTcDt5GlkE3v2JMW7UnmbIshnzxpEJ2CDz27or3y44BNH9uT7rWFHCXMoBOthq6cjXMUZZ6awPJKOc1kMDYSx6FyqnLz2cSEGFuaQ5I5G4GlIFw0Zjsx4LdpNGdLOjnWFnBIuEwAPTLSudFyvZAhoV1GQajWCw7cfKG6kpzSFglBkzqeGxG0YUPg+hIoZkuQ15WKVY9D9pebg1n+PLg5zR5iBS9MEG5wUPFy4lDMxA35JOSbfBKjASHuEhuPJElyEs7jUzwYyYizScSfYcdG7EzhpvhaE7dsFv8yccNJWSWxvdyc56pR8SCqDYIZNYpDrS6tnUW4SaWSlB/KM94hSeEmDQ15J4YmfaVJlJ8kMaW8b0jK50tD3nzJOyGRbJNe9GxIKuUnJqQhjRuD8wyRPDq38+f9/vL5nIFbFied95dns+3mBuUeXV2KwXFHEoZQZBAE+0h8p3FjILgggklxKJhQjWsCDk0CXz5REvMTDE6SvKUJIMFJMDFxAkzAEkPsrQQmSplPxLw4cQEwmr2hxDxOYzRu2fuz52ez98Gczg1hmz1fBtnZ9nOjT5ulDsGwPAKnWpsIg8djWj8S5sZMZsSJIZAHF/LwglIALwDfJLhQKnnFwTwj29tQRsxnJoG3hF6YyEgEL3pDCQaBD0xOipLCjcmDoYmSWIJ5Izc4my3flxkp3GbB+ezs/d/fn2s3N/jS4QMHDh84rOlFUQPXF8xAKGZECDPBKKf3WxJuE0MJkId5+Ekpo9rbJJBK4idBZDSTctFlJsQhr5gvZXy+icwnXq/MrZS5MFjKI25SflDjVkJvQk60ZCyn5bI4e14U7+vcUNL9++dnfw/LbfZvkH3+sFkaNxSMVPq8iUQmEfT2VVjD+CnhNoQc0oR4AXqBAgmX0wt5MAglkMnI5RRZkW8IXAgiuy3BDFTcYKJ0AUwiowMZYl2Em4SgXoD5CdHALQfOw1mQm4UGewPnxdlZcF9sd73A7sANOT6ajyIledo0LiOXUx/6N8n4JuTgC5dT9JSZzPt8+XxeTcozKHEyn59EPwyjmCXiSd6an9TqU5QNp/pIMdXqhblyrpz1G/wbTspmy3PZNschqFLYgRtGR+bNGAYCbfEbYwjMGBJ5kPBEDU18JBCRwxZjmvJfr099hiQtDrHHb8ak9nHzyNw+/fTwHz797PBnn/7Bys0en/zy4l770iFIy9wAOPzv4PMDYfBpl5sdm32mM6vY2+efH/40/McDfwx/Vh83xq5QXUl1ZusobvL3Ns6sxyQJNxSJkFDkgM2/OXO7etSmi3Ul1Znt6hdbxyzasicd+6JW96YL3Ixd0GQEZOd6wZGbU7+lw1QYp7V9DmkOSbAvaFUimrClHWnJEI36zc0pLnKLOPTaOixNcEii+oJei4JRW5K3Ndxsw2iwy60eKcNour3JI278K6pe/A+sL526437J3BRweoUqg2BFTU/8I9LzO6+B/AVyswRw0LYAjeWf73LbVQ58WPqJLrfd5Ng9zvL/CfGfLreacubC4jF5jq9pdF1uNcCwHriWSq0BSDka3S+eW81wg42kzvz61d5X12gncF1uNbnFUmfOpK4heRzA/eK51a424ZlUav2j1LXUskOeLrea9sZfW35148ZGb6p3b9yc2vX1cXNo1wejCW972vUW1eZWebywtr6x8fhMTXvj7KrUlVRntkj8yJFT6D/6UXVq+YhVp+Lt4FYzREP1wsLNG+sbN/7E1/Jv9qqWVWb8kfEIZcQw+dSQVU8J9nfaj8LS8adsckjq6yhu2L+lb765kV5ebrxeoPsvXepXFkhEbA7JG9xP/9aeclqbG6pQb6bX0xuvcw1zOziMF7ANHyQZ3ObWYfUCYsOnf/P2xtNO2HbmdjmgraQHreDWjn0fanBDDmqMW0+n31p38m47c4vK2B4UewJ45VoLuLVhcnmN6Vvc1DcnTy6k0ze+GGuY24i8PhewDwI4Swu4tWExgyO3samTZITt2MKx3Gij5ZQr9hRvvftf5wC401OMtYQb2+wGdc3LqZ01ds80YulkcTtzuwMAwvYuKqjJ1nCrudLBNdm7ez3UlGlYN3evsfYC5oaXA1/HG9rwreLW/FaSTcqGhOVOWgbE/2S3uB24hQ/1oIIKIMLWM0y1ilvLXZw9TFfNTcWX+/ieDdxO9QLeDaN45wEORPCONi3i1moXZyuElOrdtKkYAz8OcFT93MLzavw2go2gRdxaXVJtFQMcVe1sdEAml/tz7qRgbozuGPdS83iLs0BxngTyreLWaoOzVgwaN1RSZZND3PzZY2NUvdwASM6PjMwn5ddbxa3VdarNdRmikNwoJpf7Ck+oGqjIXg7vXck20m9p70RL1M3Nof/NPq9G5dbaqsHq4NiKKQpB5HIPf8QPs6OVMUSs0t/fX4GYW/K4TZWYTZWIXU7Z1Accpz6KrB7vs+j4si2pL65F5i0ipix/tRRUljdP10PkHj5UZtUObPHRcaRtDnMbtBcjhy0CG+zvDXMRtZ3u3N9b295aY3AUrUy7tBRUtvJny5zG3MDHA2pSdhtze0TK6aDdcTlwa2h8IXzwUDFQHJF34mrUv7XE4PQ6yNJkYKdSD22TQZHREXS50ZXtZ8fH+13iRo/IIUyR9EA1zK0FVSplsGyLvU2ddABH0Pmz99YrNx+tjFfc4RaWsQWUPSAbtzf3C6rRss0hHDWVG0h95QAONRwW0un1hfWD4zF3uMk9d8Vb59Cv281wc72gqqhkyzZ5OHYLEfrvlMPEbf/X6XT65sLCa48od7ihhkbgQfEO7hPABtc4N9cLKt58iNIs2+ThqC1SKFNnUADiyG35Ub9L3EZwh8CtcwAGyK6ETdib2wWV8lAxskOU3Kpjrdwwua9SDwfM6L6+uRDf3n60IrBuceshmR80zc3tRirFctsrZOUyeWo0OK29kEPxx8OHH388OjAw+g3S1hbngVEc9VIe18ppcQVviyt3pXQatyQHIBXFUZjmEQyNBmjs7c3J+gZQykgyuTudxyVuuF4ovnuO9NzRTXFzs2IID6OTElZkbqpH0A9taNdrGhjzmOVSHDJP+lHUnrsmuLk5lBoeDsyDRysr49thraAaYpExa3cv0knr4IxLcS+lxL2By03Fve5WqOFDPcXKynVkb/1RSjM41cXZu8mRspHWcCPtrGLz7Sx3uY30BL5bwa3MzU1eHwpSb3XlZG9+60QYmZu92b0v7Xq1sDXcrnc5gJsPDK/I3L6lDWsZ1F6sVTu47LoTt0rUpmXBJockpzSHpMpq3Ka1qC1ptUX+DVwKzF9H3Fa+3SSRiHYsZeLV2ROLf/nrgN8YuWWnnLg5fHSd8waPJ2w6bc8FHbJF7UlPtag+BXzx0fh1UkwPUqZtJMnx4RLZuyNE4Kly5Nb8PFW74/Iet+ei+uwOtK1x73fb4yvY3NC/fsroFPAJhNW9xBjfCUzvL38dHbBNdth3bkFHbp3VzqK/R9xWHm1+d6sfFVXWaN0s7QlbFr/jBdtnw56fBzdX2/Xct7fGr29vf4tc3PbmI/OGrxQdrto3Dahap6R2KDd3ZxBy35JK4RH6Pf5tVO8WIYKUAzfJOguuQ7m569647xGxRwgbqhz+Rlu3STdxU8os09fAeL1FLeTmcvcb/T1Bhs1tm1MW/eng6IKBm1JHMNM/C26umhsdif3t0Xb/NtKz28sRnrdYHGfk9o5qdz8LbnvispteMW5XhqX4Llq5WhHJwO0D5W/BEoh0IjeXS+krlp0bDvNmMxcMG+6c+FB5wggdz83tsQX+iV8Z9eUThr5efOiKgVtItTdmhupsbnStm6rsn8QnD+h68iXjbZhxWe0zcFvUuF3pZG4e1n1qNm6WyAzGDdw+UOsFFPl2KreWrTPamRt118DtQ23f6wKHd+9HRRqXanR5ybo2uwSKtYq37tTKslTcttRtKGp/J+2QLW5fJdeqdW31c2Oe07hJPICy5A/B3I6fsmnHBZK0nkZbc9EO74zFLZ9+5MiR5SPmBPTTqnWU4pOHNWyH7dyOGrhd09r41bj5Q+rv71U7crn+Z9UlgvWvd3bo723bul36pecNemyNaM8aymlKIxiy3FSz0fGF2/P4XtDKlN9G1olbudlRtopb8vl/MChiabKHr+jcQtfUx6HQWYjcF9TKaoPcuGFloEq+O2AD3CqWvnOH7nRzWsWl5YEwaS6nFm6U3v3GLP7dwE2zS1w/NDiepU7QuhMIjISdIdUop32Nf8FK42+pR1zUVC98ad6Uhooa3NvftTDEyE2LQ+rnJuDxZDxp5t2eIr4Nj6vchMbfUo9iFm5J08YqtKEXiXms2V7ItydulzA0ZYIWvv1pc9yggYjoKOJKXeLGJ81xSNI4pkytGltZlN41wtzdC7f5nuJ1cE7Ei7bI7Xab4xb7H33nVNuhicitvl3iJkRe1P3bgWd4Xr9floc1diJJUaOvm9kTt0CR3On9Ts9euHHt5EYLVOZXZMdZXC088xjwgj7B1xS8LVHUtPZUu9ViU9xQ7uIDKE/QehY0y402cMs4ykVuEdSEhKdPx1fJbRYyKKGib07LG8ytepulZjRukrkjqUFut4dxdXpLnaDVDLexrVHhB350a/cGvDvcBLnpzWstcCjQ2j33DLFbAdWzbFLrwyzE9sJNvtM4/imSdkfj3MYG/P5jP2z5/aMyuGBiECmRwD9BUQySkfugi/amcIvoPRfEAjE4qqJ39ZIbQrIRzf6q9J64gYNFQq54UE5zyGZPMnK75/fnfvx4tIzo7foNd8vQjFiBtEqgIarm8YHw3u7GakC+s6E+thVy6EdqaB5XbH5keOSSuoeNQzZ7koGb4M9ly/fAaDmb85MJJ0HDBJFgMOG6vSl2xgm6n+DJKUMPpfe8MVcpS8F16rdsdB6X3l9X/35cSrfcaHm2PPcNGJ0rz+Z2u6+dK9x4eUGeIOiL83henoxPaVv5M9PqplBqpxJz1M5thE/aJPA2OSRZ0w5eunTQMVsyKTea+Gy5PDe3Be7NzZVzZP97+7QkLPfsLVaxt4VVX/daQcOm4lFN0BKG7OP9KLHmA4H5sK3bUu71JBm2ynOI2zHCbS43BUDtm6G7w031a4KxWMhP6Er6pxMma8OBiVJT1Due1ZwwN+eNcxRuo/5yGfu3H8vZubIfF9QWx28x2a95KsYJT8Te+P9Np9NfF0zYPKzaXK13/LQ57cZt7GS57C9nv8H8cuXyDyhJhCKEcptUl3vtU6VI8iYvjCuJZLF4E4OT1CpBljqpq1rneH1z2o0bHPDncv7sOpjKZss5/yjQ2vUAtqZdr5RPwVzvocKLTx1xS69Z2qFK7++iZduH/eeGdwp22FBI8W94LQB2a8fwzRTXgVJOxQyEpnLqHjfF3syfjayQHiHgFgCZO6jzkVta1upU50ZPyUJVzRNNa+3y5TX0R4jRGJ56a0KWpaASnkxl/aNyPMMP+LP4okNHAZe4KX4NCuYueYyRG8bgFsjLOjlWKFSRCvFa3CLKvb/QBzzz5B61kL65sC5wpqpS5ga3ptTUsSlsdy2uFxS/FrF8dISHGFxP4PJCv3yeWomBP72F9JPV+1D9AbK0VuU2AAFXP6BnHIW4YW0srFd4bcKpQzi8m9zgJn8mbwnrKWJ/MQSO9I7JabLRQfnLVIy3fsZzMbiivA2jgduBPeqwfCiim+trFWJ4TXBzYXwhYu0MUSS7vchwT8+InggxOnrtBvkij+eVaXI09jpAXps8L3Dr7nBL30ilUq9WILqkDu2InbX/41lURW7UC9aPVqpZvtgzbK4kIV2cX8WaDxziIasww8JdaoFA8Q2/G9yQn6twu/e0tUoR2YS5ivWUYooBCsWiZRCXxsPFWD09Sh+Q9p5DeJDKwK0eH7aTZP+G3JsgtOWOCrWl4InYnAYrKO2HZNFiiuHhgC4zOOogil3ekJf2DoBG6oVa9enGuhulbG9a661HT9uTXtBlzfx0rzHt6b2qrjOsU+3G3VVXXXXV1c9P/wfkk1UZuS1syAAAAABJRU5ErkJggg==',
        title: 'Thống kê chấm công',
        description: 'Theo dõi tỷ lệ điểm danh và thời gian làm việc.',
        route: '/manage/statistics/attendance',
        icon: (size) => <IconChecklist size={size} />,
    },
];

const Statistics = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // Trạng thái cho loading, error và carousel
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStartX, setTouchStartX] = useState(null);

    // Simulate loading state
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Auto slide carousel mỗi 3 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % statisticsData.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Xử lý swipe trên mobile
    const handleTouchStart = useCallback((e) => {
        setTouchStartX(e.touches[0].clientX);
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (touchStartX === null) return;
        const diff = e.touches[0].clientX - touchStartX;
        if (Math.abs(diff) > 50) {
            setCurrentSlide((prev) =>
                diff > 0
                    ? (prev - 1 + statisticsData.length) % statisticsData.length
                    : (prev + 1) % statisticsData.length
            );
            setTouchStartX(null);
        }
    }, [touchStartX]);

    // Điều hướng đến trang chi tiết
    const handleNavigate = useCallback((route) => {
        navigate(route);
    }, [navigate]);

    // Render trạng thái loading
    if (loading) {
        return (
            <PageContainer title="Tổng quan nhân sự" description="Tổng quan hệ thống quản lý nhân sự">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    // Render trạng thái error
    if (error) {
        return (
            <PageContainer title="Tổng quan nhân sự" description="Tổng quan hệ thống quản lý nhân sự">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Tổng quan nhân sự" description="Tổng quan hệ thống quản lý nhân sự">
            <DashboardCard>
                <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
                            Tổng quan nhân sự
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            Truy cập các báo cáo chi tiết về nhân sự
                        </Typography>
                    </Box>

                    {/* Animated Banner Carousel */}
                    <Box
                        sx={{
                            position: 'relative',
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: theme.shadows[8],
                            mb: 6,
                            height: { xs: 180, sm: 260, md: 320 },
                            transition: 'box-shadow 0.3s',
                            '&:hover': { boxShadow: theme.shadows[16] },
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                    >
                        {statisticsData.map((slide, index) => (
                            <Box
                                key={slide.route}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    transition: 'opacity 0.7s, transform 0.7s',
                                    opacity: currentSlide === index ? 1 : 0,
                                    zIndex: currentSlide === index ? 2 : 1,
                                    bgcolor: 'rgba(0,0,0,0.55)',
                                    backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 100%), url(${slide.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    color: '#fff',
                                    transform: currentSlide === index ? 'scale(1)' : 'scale(1.03)',
                                }}
                            >
                                <CardContent
                                    sx={{
                                        background: 'rgba(255,255,255,0.10)',
                                        p: { xs: 2, sm: 4 },
                                        borderRadius: 3,
                                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                        backdropFilter: 'blur(4px)',
                                        minWidth: { xs: '90%', sm: 400 },
                                        maxWidth: 600,
                                        animation: currentSlide === index ? 'fadeIn 0.7s ease-in-out' : 'none',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(20px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' },
                                        },
                                    }}
                                >
                                    <Box sx={{ color: theme.palette.primary.light, mb: 1 }}>
                                        {slide.icon(48)}
                                    </Box>
                                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, letterSpacing: 1 }}>
                                        {slide.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 3, color: '#fff', opacity: 0.92 }}>
                                        {slide.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                                            color: '#fff',
                                            borderRadius: 2,
                                            px: 5,
                                            py: 1.2,
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                                            '&:hover': {
                                                background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                                            },
                                        }}
                                        onClick={() => handleNavigate(slide.route)}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </CardContent>
                            </Box>
                        ))}
                        {/* Carousel Dots */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: 0,
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 1,
                                zIndex: 10,
                            }}
                        >
                            {statisticsData.map((_, idx) => (
                                <Box
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    sx={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: '50%',
                                        background: currentSlide === idx ? theme.palette.primary.main : '#fff',
                                        opacity: currentSlide === idx ? 0.9 : 0.5,
                                        border: `2px solid ${theme.palette.primary.main}`,
                                        cursor: 'pointer',
                                        transition: 'background 0.3s, opacity 0.3s',
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Navigation Cards */}
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a202c', textAlign: 'center' }}>
                        Truy cập thống kê chi tiết
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {statisticsData.map((card, index) => (
                            <Grid item xs={12} sm={6} md={4} key={card.route}>
                                <Card
                                    onClick={() => handleNavigate(card.route)}
                                    sx={{
                                        borderRadius: 3,
                                        boxShadow: theme.shadows[2],
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'scale(1.04)',
                                            boxShadow: theme.shadows[8],
                                            backgroundColor: '#f0f7ff',
                                        },
                                        animation: 'fadeIn 0.7s ease-in-out',
                                        animationDelay: `${index * 0.1}s`,
                                        animationFillMode: 'both',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(20px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' },
                                        },
                                    }}
                                >
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ color: theme.palette.primary.main }}>
                                            {card.icon(36)}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                                            {card.description}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNavigate(card.route);
                                            }}
                                            sx={{
                                                backgroundColor: theme.palette.primary.main,
                                                borderRadius: 2,
                                                px: 4,
                                                mt: 1,
                                                alignSelf: 'center',
                                                '&:hover': {
                                                    backgroundColor: theme.palette.primary.dark,
                                                },
                                            }}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default Statistics;