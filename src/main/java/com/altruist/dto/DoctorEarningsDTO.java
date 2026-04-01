package com.altruist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorEarningsDTO {
    private BigDecimal thisMonthEarnings;
    private BigDecimal lastMonthEarnings;
    private BigDecimal totalEarnings;
    private BigDecimal averagePerConsultation;
    private List<MonthlyEarningDTO> monthlyData;
}
