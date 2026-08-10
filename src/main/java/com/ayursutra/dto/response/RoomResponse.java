package com.ayursutra.dto.response;

import com.ayursutra.constant.RoomType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {

    private String id;

    private String roomNumber;

    private String name;

    private RoomType type;

    private Integer capacity;

    private String description;

    private Boolean active;
}